import { dynamoDB } from "./dbConnection";

export const STORAGE_PROCESSLOCK_NAME = 'ProcessLock';
export const COLUMN_PROCESS_CODE = 'processCode';
export const COLUMN_INPUT_HASH = 'inputHash';
export const COLUMN_LOCKED_AT = 'lockedAt';
export const COLUMN_EXPIRES_AT = 'expiresAt';

export async function releaseLock(inputHash: string, processCode: string) {
  if (!inputHash) throw new Error('Missing inputHash');
  if (!processCode) throw new Error('Missing processCode');
  
  const params = {
    TableName: STORAGE_PROCESSLOCK_NAME,
    Key: {
      [COLUMN_PROCESS_CODE]: processCode,
      [COLUMN_INPUT_HASH]: inputHash
    }
  };

  await dynamoDB.delete(params).promise();
}

export async function acquireLock(inputHash: string, processCode: string): Promise<boolean> {
  if (!inputHash) throw new Error('Missing inputHash');
  if (!processCode) throw new Error('Missing processCode');
  
  const fifteenMinutesInMilliseconds = 15 * 60 * 1000; // lambda cannot run for more than 15 minutes, so this is a fallback if the lock is not released
  const fifteenMinutesFromNowInSeconds = Math.floor((new Date().getTime() + fifteenMinutesInMilliseconds) / 1000);
  const params = {
    TableName: STORAGE_PROCESSLOCK_NAME,
    Item: {
      [COLUMN_PROCESS_CODE]: processCode,
      [COLUMN_INPUT_HASH]: inputHash,
      [COLUMN_LOCKED_AT]: new Date().toISOString(),
      [COLUMN_EXPIRES_AT]: fifteenMinutesFromNowInSeconds
    },
    ConditionExpression: `attribute_not_exists(${COLUMN_PROCESS_CODE}) AND attribute_not_exists(${COLUMN_INPUT_HASH})` // this really needed with partitionKey and sortKey?
  };

  try {
    await dynamoDB.put(params).promise();
    return true;
  } catch (error) {
    // @ts-ignore
    if (error.code === "ConditionalCheckFailedException") {
      return false;
    } else {
      throw error;
    }
  }
}
