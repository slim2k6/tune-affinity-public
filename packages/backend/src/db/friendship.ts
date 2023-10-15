import { dynamoDB } from "./dbConnection";

export const STORAGE_FRIENDSHIP_NAME = 'Friendship';
export const COLUMN_USER_ID_SMALLER = 'userIdSmaller';
export const COLUMN_USER_ID_LARGER = 'userIdLarger';
const EXPRESSION_USER_ID_SMALLER = ':user_id_smaller';
const EXPRESSION_USER_ID_LARGER = ':user_id_larger';
export const GLOBAL_INDEX_USER_ID_LARGER = 'UserIdLarger-GlobalIndex';
const EXPRESSION_USER_ID = ':user_id';

// every friendship is stored once, with the alphabetically smaller user id as the first key and the larger user id as the second key. 
export interface Friendship {
  [COLUMN_USER_ID_SMALLER]: string;
  [COLUMN_USER_ID_LARGER]: string;
}

export interface Friend {
  spotifyUserId: string;
}

export async function createFriendship(currentUserSpotifyId: string, friendSpotifyUserId: string): Promise<void> {
  const params = getCreateFriendshipPutParams(currentUserSpotifyId, friendSpotifyUserId);

  await dynamoDB.put(params).promise();
}

export function getCreateFriendshipPutParams(currentUserSpotifyId: string, friendSpotifyUserId: string) {
  if (!currentUserSpotifyId) throw new Error('Missing currentUserSpotifyId');
  if (!friendSpotifyUserId) throw new Error('Missing friendSpotifyUserId');

  const userIdSmaller = currentUserSpotifyId < friendSpotifyUserId ? currentUserSpotifyId : friendSpotifyUserId;
  const userIdLarger = currentUserSpotifyId > friendSpotifyUserId ? currentUserSpotifyId : friendSpotifyUserId;

  const params = {
    TableName: STORAGE_FRIENDSHIP_NAME,
    Item: {
      [COLUMN_USER_ID_SMALLER]: userIdSmaller,
      [COLUMN_USER_ID_LARGER]: userIdLarger,
    } as Friendship,
  };

  return params
}

export async function getFriendship(currentUserSpotifyId: string, friendSpotifyUserId: string): Promise<Friendship | null> {
  const userIdSmaller = currentUserSpotifyId < friendSpotifyUserId ? currentUserSpotifyId : friendSpotifyUserId;
  const userIdLarger = currentUserSpotifyId > friendSpotifyUserId ? currentUserSpotifyId : friendSpotifyUserId;

  const queryParams = {
    TableName: STORAGE_FRIENDSHIP_NAME,
    KeyConditionExpression: `${COLUMN_USER_ID_SMALLER} = ${EXPRESSION_USER_ID_SMALLER} AND ${COLUMN_USER_ID_LARGER} = ${EXPRESSION_USER_ID_LARGER}`,
    ExpressionAttributeValues: {
      [EXPRESSION_USER_ID_SMALLER]: userIdSmaller,
      [EXPRESSION_USER_ID_LARGER]: userIdLarger,
    },
  };

  const result = await dynamoDB.query(queryParams).promise();
  return result.Items?.length === 1 ? result.Items[0] as Friendship : null;
}

export async function getUserFriends(spotifyUserId: string): Promise<Friend[]> {
  // current user id could exist in both columns, so we need to query both columns and combine the results
  const smallerFriends = await queryFriendsBySpotifyUserIdAndColumn(spotifyUserId, COLUMN_USER_ID_SMALLER);
  const largerFriends = await queryFriendsBySpotifyUserIdAndColumn(spotifyUserId, COLUMN_USER_ID_LARGER);

  return smallerFriends.concat(largerFriends);
}

async function queryFriendsBySpotifyUserIdAndColumn(spotifyUserId: string, columnToCheck: string): Promise<Friend[]> {
  if (!spotifyUserId) throw new Error('Missing spotifyUserId');

  const params = {
    TableName: STORAGE_FRIENDSHIP_NAME,
    IndexName: columnToCheck === COLUMN_USER_ID_LARGER ? GLOBAL_INDEX_USER_ID_LARGER : undefined,
    KeyConditionExpression: `${columnToCheck} = ${EXPRESSION_USER_ID}`,
    ExpressionAttributeValues: {
      [EXPRESSION_USER_ID]: spotifyUserId
    },
  };

  const result = await dynamoDB.query(params).promise();
  const friendShips = result.Items as Friendship[] || [];
  const columnToFetchFriendFrom = columnToCheck === COLUMN_USER_ID_LARGER ? COLUMN_USER_ID_SMALLER : COLUMN_USER_ID_LARGER; // get oppsite column to the one we queried

  return friendShips.map(friendship => ({
    spotifyUserId: friendship[columnToFetchFriendFrom]
  }));
}
