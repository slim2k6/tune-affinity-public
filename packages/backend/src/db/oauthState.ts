import { dynamoDB } from "./dbConnection";

export const STORAGE_OAUTHSTATE_NAME = 'OauthState';
export const COLUMN_STATE = 'state';
export const COLUMN_IP = 'ip';
export const COLUMN_EXPIRES_AT = 'expiresAt'; // only used for TTL in db

export interface OAuthState {
  [COLUMN_STATE]: string;
  [COLUMN_IP]: string;
  [COLUMN_EXPIRES_AT]: number;
}

export async function getAuthState(state: string) : Promise<OAuthState | null>{
  if (!state) throw new Error('Missing state');
  const stateParams = {
    TableName: STORAGE_OAUTHSTATE_NAME,
    Key: {
      [COLUMN_STATE]: state
    }
  };

  const result = await dynamoDB.get(stateParams).promise();

  if (!result.Item) {
    return null;
  } else {
    return {
      state: result.Item.state,
      ip: result.Item.ip,
      expiresAt: result.Item.expiresAt,
    } 
  }
}

export async function putAuthState(oauthState: OAuthState) {
  const { state, ip } = oauthState;
  if (!state) throw new Error('Missing state');
  if (!ip) throw new Error('Missing ip');

  const fifteenMinutesInMilliseconds = 15 * 60 * 1000;
  const fifteenMinutesFromNowInSeconds = Math.floor((new Date().getTime() + fifteenMinutesInMilliseconds) / 1000);
  const stateParams = {
    TableName: STORAGE_OAUTHSTATE_NAME,
    Item: {
      [COLUMN_STATE]: state,
      [COLUMN_IP]: ip,
      [COLUMN_EXPIRES_AT]: fifteenMinutesFromNowInSeconds
    }
  };

  await dynamoDB.put(stateParams).promise();
}

export async function deleteAuthState(state: string) {
  if (!state) throw new Error('Missing state');
  const stateParams = {
    TableName: STORAGE_OAUTHSTATE_NAME,
    Key: {
      [COLUMN_STATE]: state,
    }
  };

  await dynamoDB.delete(stateParams).promise();
};