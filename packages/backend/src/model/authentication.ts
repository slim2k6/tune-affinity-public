import * as OAuthState from "../db/oauthState";
import * as Session from "../db/session";
import * as User from "../db/user";
import * as Invite from "../db/invite";
import { UserError } from "./errors";
import { generateRandomString } from "./generateRandomString";
import { getAuthRedirectUrl, getSpotifyUser, requestAccessToken} from "./spotifyApi";

export async function initiateSpotifyLogin(callerIp: string, appRedirectBackUri: string, inviteCode: string | null) {
  const randomState = generateRandomString(16);
  const state = inviteCode ? `${randomState}_inviteCode:${inviteCode}` : randomState;

  const fiveMinutesInMilliseconds = 5 * 60 * 1000;
  const fiveMinutesInSeconds = Math.floor((new Date().getTime() + fiveMinutesInMilliseconds) / 1000);

  const oauthState = {
    state,
    ip: callerIp,
    expiresAt: fiveMinutesInSeconds
  } as OAuthState.OAuthState;

  await OAuthState.putAuthState(oauthState);

  return getAuthRedirectUrl(appRedirectBackUri, state);
}

export async function processSpotifyCallback(state: string, code: string, callerIp: string, appRedirectBackUri: string): Promise<Session.Session> {
  if (!state) throw new Error('Missing state');
  if (!callerIp) throw new Error('Missing callerIp');

  const authState = await OAuthState.getAuthState(state);
  if (!authState) {
    throw new UserError('Auth state not found');
  } else if (authState.ip !== callerIp) {
    throw new UserError('IP mismatch');
  }

  await OAuthState.deleteAuthState(state);

  const stateParts = state.split('_');
  const inviteCode = stateParts.length > 1 && stateParts[1].startsWith('inviteCode:') ? stateParts[1].split(':')[1] : null;

  const { accessToken, refreshToken } = await requestAccessToken(code, appRedirectBackUri);
  const { spotifyUserId } = await getSpotifyUser(accessToken);

  const newUser = {
    spotifyUserId,
    refreshToken,
  } as User.NewUser;

  await User.putNewUser(newUser);

  const sessionId = generateRandomString(16);
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
  const oneDayFromNowInSeconds = Math.floor((new Date().getTime() + oneDayInMilliseconds) / 1000);

  const session = {
    sessionId,
    spotifyUserId,
    expiresAt: oneDayFromNowInSeconds,
  } as Session.Session;
  await Session.putSession(session);

  if (inviteCode) {
    try {
      const invite = await Invite.getInvite(inviteCode);
      if (!invite) {
        console.log("Invite code not found");
      } else {
        const friendSpotifyUserId = invite.spotifyUserId;
        if (!friendSpotifyUserId) {
          console.log("Invite code owner not found");
        } else if (spotifyUserId === friendSpotifyUserId) {
          console.log("User used own invite code");
        } else {
          await Invite.consumeInviteToCreateFriendship(spotifyUserId, friendSpotifyUserId, inviteCode);
        }
      }
    } catch (error) {
      console.error("Error handling invite code: " + inviteCode, error);
    }
  }

  return session;
}

export async function logoutUser(sessionId: string) {
  await Session.deleteSession(sessionId);
};
