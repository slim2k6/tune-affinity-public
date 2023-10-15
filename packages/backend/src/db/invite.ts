import { dynamoDB } from "./dbConnection";
import { getCreateFriendshipPutParams } from "./friendship";

export const STORAGE_INVITE_NAME = 'Invite';
export const COLUMN_INVITE_CODE = 'inviteCode';
export const COLUMN_SPOTIFY_USER_ID = 'spotifyUserId';
export const GLOBAL_INDEX_INVITE_CODE = 'globalIndexInviteCode';
const EXPRESSION_INVITE_CODE = ':expressionInviteCode';
const EXPRESSION_SPOTIFY_USER_ID = ':expressionSpotifyUserId';

export interface InviteCode {
  [COLUMN_INVITE_CODE]: string;
  [COLUMN_SPOTIFY_USER_ID]: string;
}

export async function getInvites(spotifyUserId: string): Promise<InviteCode[]> {
  if (!spotifyUserId) throw new Error('Missing spotifyUserId');

  const params = {
    TableName: STORAGE_INVITE_NAME,
    KeyConditionExpression: `${COLUMN_SPOTIFY_USER_ID} = ${EXPRESSION_SPOTIFY_USER_ID}`, 
    ExpressionAttributeValues: {
      [EXPRESSION_SPOTIFY_USER_ID]: spotifyUserId,
    },
  };

  const data = await dynamoDB.query(params).promise();
  return data.Items as InviteCode[];
}

export async function getInvite(inviteCode: string): Promise<InviteCode | null> {
  if (!inviteCode) throw new Error('Missing inviteCode');

  const inviteCodeParams = {
    TableName: STORAGE_INVITE_NAME,
    IndexName: GLOBAL_INDEX_INVITE_CODE,
    KeyConditionExpression: `${COLUMN_INVITE_CODE} = ${EXPRESSION_INVITE_CODE}`, 
    ExpressionAttributeValues: {
      [EXPRESSION_INVITE_CODE]: inviteCode,
    },
  };

  const result = await dynamoDB.query(inviteCodeParams).promise();
  return result.Items?.length === 1 ? result.Items[0] as InviteCode : null;
}

export async function putInvite(spotifyUserId: string, inviteCode: string): Promise<void> {
  if (!spotifyUserId) throw new Error('Missing spotifyUserId');
  if (!inviteCode) throw new Error('Missing inviteCode');

  const params = {
    TableName: STORAGE_INVITE_NAME,
    Item: {
      [COLUMN_SPOTIFY_USER_ID]: spotifyUserId,
      [COLUMN_INVITE_CODE]: inviteCode,
    } as InviteCode,
  };

  await dynamoDB.put(params).promise();
}

export async function deleteInvite(spotifyUserId: string, inviteCode: string): Promise<void> {
  if (!spotifyUserId) throw new Error('Missing spotifyUserId');
  if (!inviteCode) throw new Error('Missing inviteCode');

  const params = {
    TableName: STORAGE_INVITE_NAME,
    Key: {
      [COLUMN_SPOTIFY_USER_ID]: spotifyUserId,
      [COLUMN_INVITE_CODE]: inviteCode,
    },
  };

  await dynamoDB.delete(params).promise();
}


export async function consumeInviteToCreateFriendship(currentUserSpotifyId: string, friendSpotifyUserId: string, inviteCode: string): Promise<void> {
  if (!friendSpotifyUserId) throw new Error('Missing friendSpotifyUserId');
  if (!inviteCode) throw new Error('Missing inviteCode');

  const invite = await getInvite(inviteCode);
  if (!invite) throw new Error('Invite not found');


  const putCreateFriendshipParams = getCreateFriendshipPutParams(currentUserSpotifyId, friendSpotifyUserId);

  const transactWriteParams = {
    TransactItems: [
      {
        Put: putCreateFriendshipParams,
      },
      {
        Delete: {
          TableName: STORAGE_INVITE_NAME,
          Key: {
            [COLUMN_SPOTIFY_USER_ID]: friendSpotifyUserId,
            [COLUMN_INVITE_CODE]: inviteCode,
          },
        },
      },
    ],
  };

  await dynamoDB.transactWrite(transactWriteParams).promise();
}