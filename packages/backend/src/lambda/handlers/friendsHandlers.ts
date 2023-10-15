import * as Friendship from '../../db/friendship';
import { handle500ServerError, handle200OK } from './httpResponseHandlers';

export async function handleGetFriends(event: SecuredLambdaEvent) {
  const spotifyUserId = event.requestContext.authorizer.principalId;

  try {
    const friends = await Friendship.getUserFriends(spotifyUserId);
    return handle200OK("GET, OPTIONS", friends);
  } catch (error) {
    return handle500ServerError(error, 'An error occurred while fetching the user friends');
  }
};