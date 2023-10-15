import * as Comparison from '../db/comparison';
import * as User from '../db/user';
import * as UserTrackSet from '../db/userTrackSet';
import * as ProcessLock from '../db/processLock';
import { getSpotifyApiInstance, fetchTracksInfo, fetchArtistsInfo } from './spotifyApi';
import { UserError, ProcessLockError } from './errors';

const MAX_USERS = Number(process.env.MAX_USERS || "5");
const PROCESS_CODE = "CREATECOMPARISON";

export async function compareUsers(initiatingUserSpotifyId: string, otherUsers: string[]) {
  if (otherUsers.includes(initiatingUserSpotifyId)) {
    throw new Error("Other users cannot include the initiating user")
  }

  if (otherUsers.length === 0) {
    throw new Error("No other users to compare with");
  }

  const allUsers = [initiatingUserSpotifyId, ...otherUsers];

  if (allUsers.length > MAX_USERS) {
    throw new UserError("Too many users to compare with, max is " + (MAX_USERS) + " but got " + (allUsers.length) + " users");
  }

  const initiatingUser = await User.getUser(initiatingUserSpotifyId);
  if (!initiatingUser) {
    throw new Error("Initiating user not found: " + initiatingUserSpotifyId);
  } 

  const sortedUsers = allUsers.sort();
  const inputHash = sortedUsers.join('-');

  const lockAcquired = await ProcessLock.acquireLock(inputHash, PROCESS_CODE);

  if (!lockAcquired) {
    throw new ProcessLockError("Lock could not be acquired for inputhash: " + inputHash + ", process: " + PROCESS_CODE + ".");
  }

  const allUsersSet = [...new Set(allUsers)];
  const uniqueTracksForEachUser = await Promise.all(allUsersSet.map(async (userId) => {
    return await UserTrackSet.getUserUniqueTrackIds(userId);
  }));

  const sharedTracksByUserMap = createSharedTracksMap(uniqueTracksForEachUser);
  const spotifyApi = await getSpotifyApiInstance(initiatingUser.refreshToken);

  const sharedTracksInfoMap = await fetchTracksInfo(Array.from(sharedTracksByUserMap.keys()), spotifyApi);
  const artistInfo = await fetchArtistsInfo(sharedTracksInfoMap, spotifyApi);

  const comparison = {
    sharedTracksInfoMap,
    sharedTracksByUserMap,
    artistInfo,
    allUsers: sortedUsers
  } as Comparison.Comparison;
  await Comparison.saveComparisonData(comparison);
}

function createSharedTracksMap(uniqueTracksForEachUser: UserTrackSet.UserTrackSet[]) {
  const sharedTracksMap = new Map();

  uniqueTracksForEachUser.forEach(({ spotifyUserId, uniqueTrackIds }) => {
    uniqueTrackIds.forEach((trackId) => {
      if (sharedTracksMap.has(trackId)) {
        sharedTracksMap.get(trackId)[spotifyUserId] = true;
      } else {
        sharedTracksMap.set(trackId, { [spotifyUserId]: true });
      }
    });
  });

  // Filter out the tracks that are not shared by at least two users
  for (const [trackId, users] of sharedTracksMap.entries()) {
    const userCount = Object.keys(users).length;
    if (userCount < 2) {
      sharedTracksMap.delete(trackId);
    }
  }

  return sharedTracksMap;
}

export async function cleanUpCreateComparison(initiatingUser: string, otherUsers: string[]) {
  const allUsers = [initiatingUser, ...otherUsers];
  const sortedUsers = allUsers.sort();
  const inputHash = sortedUsers.join('-');
  await ProcessLock.releaseLock(inputHash, PROCESS_CODE);
}
