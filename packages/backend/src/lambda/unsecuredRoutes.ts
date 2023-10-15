import { APIGatewayProxyEvent } from "aws-lambda";
import { handleSpotifyCallback, handleSpotifyLogin } from "./handlers/authenticateHandlers";
import { handle404NotFound } from "./handlers/httpResponseHandlers";

export const handler = async (event: APIGatewayProxyEvent) => {
  if (event.resource === '/auth/spotify/login' && event.httpMethod === 'GET') {
    return await handleSpotifyLogin(event);
  } else if (event.resource === '/auth/spotify/callback' && event.httpMethod === 'GET') {
    return await handleSpotifyCallback(event);
  }

  return handle404NotFound(new Error('Lambda entered with bad path'));
};
