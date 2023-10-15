import { dynamoDB } from "./dbConnection";

export const STORAGE_COMPARISON_NAME = 'Comparison';
export const COLUMN_COMPARISON_ID = 'comparisonId';
export const COLUMN_SHARED_TRACKS_INFO = 'sharedTracksInfoMap';
export const COLUMN_SHARED_TRACKS_BY_USER = 'sharedTracksByUserMap';
export const COLUMN_ARTIST_INFO = 'artistInfo';
export const COLUMN_ALL_USERS = 'allUsers';
export const COLUMN_UPDATED_AT = 'updatedAt';

export interface Comparison {
  [COLUMN_SHARED_TRACKS_INFO]: Map<string, any>;
  [COLUMN_SHARED_TRACKS_BY_USER]: Map<string, any>;
  [COLUMN_ARTIST_INFO]: Map<string, any>;
  [COLUMN_ALL_USERS]: string[];
  [COLUMN_UPDATED_AT]: string;
}

export async function saveComparisonData(comparison: Comparison): Promise<void> {
  const comparisonId = generateComparisonId(comparison.allUsers);

  const params = {
    TableName: STORAGE_COMPARISON_NAME,
    Item: {
      [COLUMN_COMPARISON_ID]: comparisonId,
      [COLUMN_SHARED_TRACKS_INFO]: Object.fromEntries(comparison.sharedTracksInfoMap),
      [COLUMN_SHARED_TRACKS_BY_USER]: Object.fromEntries(comparison.sharedTracksByUserMap),
      [COLUMN_ARTIST_INFO]: Object.fromEntries(comparison.artistInfo),
      [COLUMN_ALL_USERS]: comparison.allUsers,
      [COLUMN_UPDATED_AT]: new Date().toISOString(),
    }
  };

  await dynamoDB.put(params).promise();
}

export async function getComparison(userIds: string[]): Promise<Comparison | null> {
  const comparisonId = generateComparisonId(userIds);

  const params = {
    TableName: STORAGE_COMPARISON_NAME,
    Key: {
      [COLUMN_COMPARISON_ID]: comparisonId
    }
  };

  const result = await dynamoDB.get(params).promise();
  return result.Item ? result.Item as Comparison : null;
}

function generateComparisonId(userIds: string[]): string {
  if (!userIds || userIds.length === 0) throw new Error('No user ids provided');

  const sortedUsers = userIds.sort();
  return sortedUsers.join('-');
}
