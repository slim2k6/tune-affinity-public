import { handle200OK, handle202Accepted, handle400BadRequest, handle401Unauthorized, handle500ServerError } from './httpResponseHandlers';
import * as User from '../../db/user';
import * as Friendship from '../../db/friendship';
import * as Comparison from '../../db/comparison';
import { invokeCreateComparison } from '../../model/lambda';

const allowedMethods = "GET, OPTIONS";

export async function handleGetComparisons (event: SecuredLambdaEvent) {
  const currentUserSpotifyId = event.requestContext.authorizer.principalId;
  const friendSpotifyUserId = event.pathParameters?.friendSpotifyUserId;

  if (!friendSpotifyUserId) {
    return handle400BadRequest(
      new Error('User ' + currentUserSpotifyId + 'tried to compare without providing friendSpotifyUserId.'), 
      'Missing friendSpotifyUserId');
  }

  if (currentUserSpotifyId === friendSpotifyUserId) {
    return handle400BadRequest(
      new Error('User ' + currentUserSpotifyId + 'tried to compare with its own user.'), 
      'Cant compare with yourself');
  }

  const currentUser = await User.getUser(currentUserSpotifyId);
  if (!currentUser) return handle500ServerError(new Error('Current user not found: ' + currentUserSpotifyId), 'Something bad happened');

  if (currentUser.lastSync.endCode !== User.LAST_SYNC_END_CODE_SUCCESS) {
    const message = getComparisonNotReadyMessage(currentUser);
    return handle202Accepted(allowedMethods, message);
  }

  const friendUser = await User.getUser(friendSpotifyUserId);
  if (!friendUser) return handle400BadRequest(new Error('Friend user not found: ' + friendSpotifyUserId), 'Friend not found: ' + friendSpotifyUserId);

  if (friendUser.lastSync.endCode !== User.LAST_SYNC_END_CODE_SUCCESS) {
    const message = getComparisonNotReadyMessage(friendUser);
    return handle202Accepted(allowedMethods, message);
  }

  const isFriends = await Friendship.getFriendship(currentUserSpotifyId, friendSpotifyUserId);
  if (!isFriends) {
    return handle401Unauthorized(
      new Error('User ' + currentUserSpotifyId + 'tried to compare with non-friend user ' + friendSpotifyUserId), 
      'Not friends with: ' + friendSpotifyUserId);
  }

  const comparison = await Comparison.getComparison([currentUserSpotifyId, friendSpotifyUserId]);

  if (comparison) {
    return handle200OK(allowedMethods, {
      updatedAt: comparison.updatedAt,
      artistInfo: comparison.artistInfo,
      sharedTracksByUser: comparison.sharedTracksByUserMap,
      sharedTracksInfo: comparison.sharedTracksInfoMap
    });
  } else {
    await invokeCreateComparison(currentUserSpotifyId, [friendSpotifyUserId]);
    return handle202Accepted(allowedMethods, 'Comparison not ready yet. Reload the page after a few minutes.');
  }
};

function getComparisonNotReadyMessage(user: User.User) : string {
  const endCode = user.lastSync.endCode;
  const userId = user.spotifyUserId;

  if (endCode === User.LAST_SYNC_END_CODE_NOT_COMPLETED) {
    return 'Playlist download for ' + userId + ' is not finished yet. Reload the page after a few minutes.';
  } else if (endCode === User.LAST_SYNC_END_CODE_ERROR) {
    return 'Something went wrong when downloading playlists for ' + userId + ' playlists, contact support.';
  } else if (endCode === User.LAST_SYNC_END_CODE_TIMEOUT) {
    return 'Playlist download was timed out. User ' + userId + ' must go to https://www.tuneaffinity.com and login again to restart playlist download.';
  } else {
    throw new Error('Unknown lastSync.endCode: ' + endCode + ' for user ' + userId);
  }
}