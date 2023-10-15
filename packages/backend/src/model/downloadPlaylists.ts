import * as User from '../db/user';
import * as Playlist_db from '../db/playlist';
import * as UserTrackSet from '../db/userTrackSet';
import * as ProcessLock from '../db/processLock';
import { ProcessLockError } from './errors';
import { getSpotifyApiInstance, getAllPlaylists, getAllTrackIds, Playlist } from './spotifyApi';


export const PROCESS_CODE = "DOWNLOADSPOTIFYPLAYLISTS";

export async function downloadPlaylists(spotifyUserId: string) {
  const lockAcquired = await ProcessLock.acquireLock(spotifyUserId, PROCESS_CODE);

  if (!lockAcquired) {
    throw new ProcessLockError("Lock could not be acquired for user" + spotifyUserId + " process " + PROCESS_CODE + ".");
  }

  const user = await User.getUser(spotifyUserId);
  if (!user) {
    throw new Error("User not found: " + spotifyUserId);
  }

  const spotifyApi = await getSpotifyApiInstance(user.refreshToken);

  const newPlaylists = await getAllPlaylists(spotifyApi);
  const existingPlaylists = await Playlist_db.getExistingPlaylists(user.spotifyUserId);

  const playlistsToDelete = findPlaylistsToDelete(existingPlaylists, newPlaylists);

  await Playlist_db.deletePlaylists(user.spotifyUserId, playlistsToDelete);

  const unchangedPlaylistIds = [];
  const allTrackIds = [];
  let isUserTrackSetsOutdated = false;

  for (const newPlaylist of newPlaylists) {
    const existingPlaylist = existingPlaylists.find(p => p.playlistId === newPlaylist.id);

    if (!existingPlaylist || existingPlaylist.snapshotId !== newPlaylist.snapshotId) {
      const trackIds = await getAllTrackIds(spotifyApi, newPlaylist);
      allTrackIds.push(...trackIds);

      const playlist = {
        spotifyUserId: user.spotifyUserId,
        playlistId: newPlaylist.id,
        name: newPlaylist.name,
        snapshotId: newPlaylist.snapshotId,
        type: newPlaylist.type,
        trackIds: trackIds,
      } as Playlist_db.Playlist;

      await Playlist_db.saveOrUpdatePlaylist(playlist);
      isUserTrackSetsOutdated = true;
    } else {
      unchangedPlaylistIds.push(newPlaylist.id);
    }
  }

  if (isUserTrackSetsOutdated) {
    const fetchedUnchangedPlaylists = await Playlist_db.getPlaylistsByIds(user.spotifyUserId, unchangedPlaylistIds);

    for (const fetchedPlaylist of fetchedUnchangedPlaylists) {
      allTrackIds.push(...fetchedPlaylist.trackIds);
    }

    const uniqueTrackIds = [...new Set(allTrackIds)];

    const userTrackSet = {
      spotifyUserId: user.spotifyUserId,
      uniqueTrackIds: uniqueTrackIds,
    } as UserTrackSet.UserTrackSet;

    await UserTrackSet.saveUserUniqueTrackIds(userTrackSet);
  }
}

export async function cleanUpDownloadPlaylists(spotifyUserId: string) {
  await ProcessLock.releaseLock(spotifyUserId, PROCESS_CODE);
}

function findPlaylistsToDelete(oldPlaylists: Playlist_db.Playlist[], currentPlaylists: Playlist[]): string[] {
  const currentIds = new Set(currentPlaylists.map(p => p.id));
  const oldIds = oldPlaylists.map(p => p.playlistId);
  const idsToDelete = oldIds.filter((playlistId) => !currentIds.has(playlistId));

  return idsToDelete;
}
