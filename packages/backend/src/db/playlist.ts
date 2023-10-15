import { dynamoDB } from "./dbConnection";

export const STORAGE_PLAYLIST_NAME = 'Playlist';
export const COLUMN_SPOTIFY_USER_ID = 'spotifyUserId';
export const COLUMN_PLAYLIST_ID = 'playlistId';
export const COLUMN_NAME = 'name';
export const COLUMN_SNAPSHOT_ID = 'snapshotId';
export const COLUMN_TYPE = 'type';
export const COLUMN_TRACK_IDS = 'trackIds';
export const COLUMN_SAVED_AT = 'savedAt';
const EXPRESSION_SPOTIFY_USER_ID = ':spotifyUserId';

export interface Playlist {
  [COLUMN_SPOTIFY_USER_ID]: string;
  [COLUMN_PLAYLIST_ID]: string;
  [COLUMN_NAME]: string;
  [COLUMN_SNAPSHOT_ID]: string;
  [COLUMN_TYPE]: string;
  [COLUMN_TRACK_IDS]: string[];
  [COLUMN_SAVED_AT]: string;
}

export async function saveOrUpdatePlaylist(playlist: Playlist): Promise<void> {
  const { spotifyUserId, playlistId, name, snapshotId, type, trackIds } = playlist;

  if (!spotifyUserId) throw new Error('Missing spotifyUserId');
  if (!playlistId || !name || !snapshotId || !type || !trackIds) throw new Error('Missing playlist properties');

  const params = {
    TableName: STORAGE_PLAYLIST_NAME,
    Item: {
      [COLUMN_SPOTIFY_USER_ID]: spotifyUserId,
      [COLUMN_PLAYLIST_ID]: playlistId,
      [COLUMN_NAME]: name,
      [COLUMN_SNAPSHOT_ID]: snapshotId,
      [COLUMN_TYPE]: type,
      [COLUMN_TRACK_IDS]: trackIds,
      [COLUMN_SAVED_AT]: new Date().toISOString(),
    }
  };

  await dynamoDB.put(params).promise();
}

export async function deletePlaylists(spotifyUserId: string, playlistIdsToDelete: string[]): Promise<void> {
  if (!spotifyUserId) throw new Error('Missing spotifyUserId');

  const itemsToDelete = playlistIdsToDelete.map(playlistId => ({
    DeleteRequest: {
      Key: { [COLUMN_SPOTIFY_USER_ID]: spotifyUserId, [COLUMN_PLAYLIST_ID]: playlistId }
    }
  }));

  const DYNAMO_DB_BATCH_WRITE_LIMIT = 25;
  const batches = [];
  for (let i = 0; i < itemsToDelete.length; i += DYNAMO_DB_BATCH_WRITE_LIMIT) {
    batches.push(itemsToDelete.slice(i, i + DYNAMO_DB_BATCH_WRITE_LIMIT));
  }

  for (const batch of batches) {
    const params = {
      RequestItems: {
        [STORAGE_PLAYLIST_NAME]: batch
      }
    };

    try {
      await dynamoDB.batchWrite(params).promise();
    } catch (error) {
      console.error('Error deleting batch in DynamoDB:', error, batch);
    }
  }
}

export async function getExistingPlaylists(spotifyUserId: string): Promise<Playlist[]> {
  if (!spotifyUserId) throw new Error('Missing spotifyUserId');

  const params = {
    TableName: STORAGE_PLAYLIST_NAME,
    KeyConditionExpression: `${COLUMN_SPOTIFY_USER_ID} = ${EXPRESSION_SPOTIFY_USER_ID}`,
    ExpressionAttributeValues: { [EXPRESSION_SPOTIFY_USER_ID]: spotifyUserId }
  };

  const result = await dynamoDB.query(params).promise();
  return result.Items as Playlist[] || [];
}

export async function getPlaylistsByIds(spotifyUserId: string, playlistIds: string[]): Promise<Playlist[]> {
  if (!spotifyUserId) throw new Error('Missing spotifyUserId');

  if (playlistIds.length === 0) return [];

  const keys = playlistIds.map(id => ({ [COLUMN_SPOTIFY_USER_ID]: spotifyUserId, [COLUMN_PLAYLIST_ID]: id }));

  const DYNAMO_DB_BATCH_GET_LIMIT = 100;
  const batches = [];
  for (let i = 0; i < keys.length; i += DYNAMO_DB_BATCH_GET_LIMIT) {
    batches.push(keys.slice(i, i + DYNAMO_DB_BATCH_GET_LIMIT));
  }

  const allPlaylists = [];
  for (const batch of batches) {
    const params = {
      RequestItems: {
        [STORAGE_PLAYLIST_NAME]: {
          Keys: batch
        }
      }
    };

    const result = await dynamoDB.batchGet(params).promise();

    if (result.Responses) {
      const playlists = result.Responses[STORAGE_PLAYLIST_NAME] as Playlist[] || [];
      allPlaylists.push(...playlists);
    }
  }

  return allPlaylists
}
