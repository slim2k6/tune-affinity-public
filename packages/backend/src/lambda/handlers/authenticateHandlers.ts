import { logoutUser, processSpotifyCallback, initiateSpotifyLogin } from "../../model/authentication";
import { invokeDownloadPlaylists } from "../../model/lambda";
import { UserError } from "../../model/errors";
import { AUTHENTICATED_REDIRECT_URI, SPOTIFY_REDIRECT_BACK_URI, WEB_BASE_URI } from "../../model/constants";
import { handle302Redirect, handle401Unauthorized, handle500ServerError } from "./httpResponseHandlers";
import { APIGatewayProxyEvent } from "aws-lambda";

export async function handleSpotifyLogin(event: APIGatewayProxyEvent) {
  const inviteCode = event.queryStringParameters ? event.queryStringParameters['invite-code'] || null : null;
  const ip = event.requestContext.identity.sourceIp;

  try {
    const redirectURL = await initiateSpotifyLogin(ip, SPOTIFY_REDIRECT_BACK_URI, inviteCode);
    return handle302Redirect(redirectURL);
  } catch (error) {
    return handle500ServerError(error, 'An error occurred while initiating the Spotify login');
  }
}

export async function handleSpotifyCallback(event: APIGatewayProxyEvent) {
  const code = event.queryStringParameters?.code;
  const state = event.queryStringParameters?.state;
  const callerIp = event.requestContext.identity.sourceIp;

  if (!code || !state) {
    return handle401Unauthorized(new Error('Missing code or state'));
  }

  try {
    const session = await processSpotifyCallback(state, code, callerIp, SPOTIFY_REDIRECT_BACK_URI);
    await invokeDownloadPlaylists(session.spotifyUserId);

    const sessionCookie = {
      sessionId: session.sessionId,
      expiresAt: new Date(session.expiresAt),
    };
    return handle302Redirect(AUTHENTICATED_REDIRECT_URI, sessionCookie);
  } catch (error) {
    if (error instanceof UserError) {
      return handle401Unauthorized(error, 'State missmatch');
    } else {
      return handle500ServerError(error, 'An error occurred while processing the Spotify callback');
    }
  }
}

export async function handleLogout(event: SecuredLambdaEvent) {
  const sessionId = event.headers.Cookie.replace(/(?:(?:^|.*;\s*)session\s*\=\s*([^;]*).*$)|^.*$/, "$1");

  try {
    await logoutUser(sessionId);
    const sessionCookie = {sessionId: null, expiresAt: new Date('Thu, 01 Jan 1970 00:00:00 GMT')};
    return handle302Redirect(WEB_BASE_URI, sessionCookie);
  } catch (error) {
    return handle500ServerError(error, 'An error occurred while logging out');
  }
}