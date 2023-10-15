import { dynamoDB } from "./dbConnection";

export const STORAGE_USER_NAME = 'User';
export const COLUMN_SPOTIFY_USER_ID = 'spotifyUserId';
export const COLUMN_REFRESH_TOKEN = 'refreshToken';
export const COLUMN_LAST_SYNC = 'lastSync';
const EXPRESSION_LAST_SYNC = ':lastSync';

export const LAST_SYNC_END_CODE_SUCCESS = 'Success';
export const LAST_SYNC_END_CODE_ERROR = 'Error';
export const LAST_SYNC_END_CODE_TIMEOUT = 'Timeout';
export const LAST_SYNC_END_CODE_NOT_COMPLETED = 'Not completed';

export interface UserBase {
  [COLUMN_SPOTIFY_USER_ID]: string;
}

export interface NewUser extends UserBase {
  [COLUMN_REFRESH_TOKEN]: string;
}

export interface User extends NewUser {
  [COLUMN_LAST_SYNC]: LastSync;
}

interface LastSync {
  endCode: string;
  endTime: string;
}

export async function getUser(spotifyUserId: string): Promise<User | null> {
  if (!spotifyUserId) throw new Error('Missing spotifyUserId');
  const getUserParams = {
    TableName: STORAGE_USER_NAME,
    Key: {
      [COLUMN_SPOTIFY_USER_ID]: spotifyUserId
    }
  };

  const result = await dynamoDB.get(getUserParams).promise();

  return result.Item ? result.Item as User : null;
}

export async function putNewUser(newUser: NewUser): Promise<void> {
  if (!newUser.spotifyUserId) throw new Error('Missing spotifyUserId');
  if (!newUser.refreshToken) throw new Error('Missing refreshToken');


  const user: User = {
    spotifyUserId: newUser.spotifyUserId,
    refreshToken: newUser.refreshToken,
    lastSync: {
      endCode: LAST_SYNC_END_CODE_NOT_COMPLETED,
      endTime: new Date().toISOString()
    }
  };

  const newUserParams = {
    TableName: STORAGE_USER_NAME,
    Item: user
  };

  await dynamoDB.put(newUserParams).promise();
}

export async function setLastSyncSuccess(spotifyUserId: string): Promise<void> {
  await updateLastSync(spotifyUserId, LAST_SYNC_END_CODE_SUCCESS);
}

export async function setLastSyncError(spotifyUserId: string): Promise<void> {
  await updateLastSync(spotifyUserId, LAST_SYNC_END_CODE_ERROR);
}

export async function setLastSyncTimeout(spotifyUserId: string): Promise<void> {
  await updateLastSync(spotifyUserId, LAST_SYNC_END_CODE_TIMEOUT);
}

export async function updateLastSync(spotifyUserId: string, endCode: string): Promise<void> {
  if (!spotifyUserId) throw new Error('Missing spotifyUserId');
  if (!endCode) throw new Error('Missing endCode');

  const params = {
    TableName: STORAGE_USER_NAME,
    Key: { 
      [COLUMN_SPOTIFY_USER_ID]: spotifyUserId 
    },
    UpdateExpression: `SET ${COLUMN_LAST_SYNC} = ${EXPRESSION_LAST_SYNC}`,
    ExpressionAttributeValues: {
      [EXPRESSION_LAST_SYNC]: {
        endCode: endCode,
        endTime: new Date().toISOString()
      }
    }
  };

  await dynamoDB.update(params).promise();
}
