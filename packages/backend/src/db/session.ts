import { dynamoDB } from "./dbConnection";

export const STORAGE_SESSIONS_NAME = 'Sessions';
export const COLUMN_SESSION_ID = 'sessionId';
export const COLUMN_SPOTIFY_USER_ID = 'spotifyUserId';
export const COLUMN_EXPIRES_AT = 'expiresAt';

export interface Session {
  [COLUMN_SESSION_ID]: string;
  [COLUMN_SPOTIFY_USER_ID]: string;
  [COLUMN_EXPIRES_AT]: number;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  if (!sessionId) throw new Error('Missing sessionId');
  
  const params = {
    TableName: STORAGE_SESSIONS_NAME,
    Key: {
      [COLUMN_SESSION_ID]: sessionId,
    }
  };

  const result = await dynamoDB.get(params).promise();

  if (!result.Item) {
    return null;
  } else {
    return {
      [COLUMN_SESSION_ID]: result.Item.sessionId,
      [COLUMN_SPOTIFY_USER_ID]: result.Item.spotifyUserId,
      [COLUMN_EXPIRES_AT]: result.Item.expiresAt,
    };
  }
}

export async function putSession(session: Session) {
  const { sessionId, spotifyUserId, expiresAt } = session;
  
  if (!sessionId) throw new Error('Missing sessionId');
  if (!spotifyUserId) throw new Error('Missing spotifyUserId');
  if (!expiresAt) throw new Error('Missing expiresAt');
  
  const sessionParams = {
    TableName: STORAGE_SESSIONS_NAME,
    Item: {
      [COLUMN_SESSION_ID]: sessionId,
      [COLUMN_SPOTIFY_USER_ID]: spotifyUserId,
      [COLUMN_EXPIRES_AT]: expiresAt
    }
  };

  await dynamoDB.put(sessionParams).promise();
}

export async function deleteSession(sessionId: string) {
  if (!sessionId) throw new Error('Missing sessionId');
  
  const sessionParams = {
    TableName: STORAGE_SESSIONS_NAME,
    Key: {
      [COLUMN_SESSION_ID]: sessionId,
    }
  };

  await dynamoDB.delete(sessionParams).promise();
}
