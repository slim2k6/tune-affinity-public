import * as User from '../db/user';
import { ProcessLockError } from '../model/errors';
import { downloadPlaylists, cleanUpDownloadPlaylists } from '../model/downloadPlaylists';

export const handler = async (event: DownloadPlaylistsEvent, context: LambdaContext) => {
  const spotifyUserId = event.spotifyUserId;

  try {
    const remainingTime = context.getRemainingTimeInMillis() - 1000;
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('Timeout'), remainingTime));

    const downloadPromise = downloadPlaylists(spotifyUserId);

    await Promise.race([timeoutPromise, downloadPromise]);  // work must complete before lambda times out so we can end the process gracefully
    await User.setLastSyncSuccess(spotifyUserId);
  } catch (error) {
    if (error === 'Timeout') {
      console.warn('Timeout while syncing playlists');
      await User.setLastSyncTimeout(spotifyUserId);
    } else if (error instanceof ProcessLockError) {
      console.warn(error.message);
    } else {
      console.error('Error while syncing playlists:', error);
      await User.setLastSyncError(spotifyUserId);
    }
  } finally {
    await cleanUpDownloadPlaylists(spotifyUserId);
  }
};