import { dynamoDB } from "./dbConnection";

export const STORAGE_USERTRACKSET_NAME = 'userTrackSet';
export const COLUMN_SPOTIFY_USER_ID = 'spotifyUserId';
export const COLUMN_UNIQUE_TRACK_IDS = 'uniqueTrackIds';

export interface UserTrackSet {
  [COLUMN_SPOTIFY_USER_ID]: string;
  [COLUMN_UNIQUE_TRACK_IDS]: string[];
}

export async function getUserUniqueTrackIds(spotifyUserId: string): Promise<UserTrackSet> {
  if (!spotifyUserId) throw new Error('Missing spotifyUserId');

  const params = {
    TableName: STORAGE_USERTRACKSET_NAME,
    Key: {
      [COLUMN_SPOTIFY_USER_ID]: spotifyUserId
    }
  };

  const result = await dynamoDB.get(params).promise();
  return result.Item ? result.Item as UserTrackSet : { spotifyUserId, uniqueTrackIds: [] };
}

export async function saveUserUniqueTrackIds(userTrackSet: UserTrackSet): Promise<void> {
  const { spotifyUserId, uniqueTrackIds } = userTrackSet;

  if (!spotifyUserId) throw new Error('Missing spotifyUserId');
  if (!uniqueTrackIds) throw new Error('Missing uniqueTrackIds');

  const params = {
    TableName: STORAGE_USERTRACKSET_NAME,
    Item: {
      [COLUMN_SPOTIFY_USER_ID]: spotifyUserId,
      [COLUMN_UNIQUE_TRACK_IDS]: uniqueTrackIds
    }
  };

  await dynamoDB.put(params).promise();
}
