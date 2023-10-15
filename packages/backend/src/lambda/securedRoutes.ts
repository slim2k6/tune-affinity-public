import { handleGetComparisons } from "./handlers/comparisonHandlers";
import { handleGetFriends } from "./handlers/friendsHandlers";
import { handle404NotFound, handle401Unauthorized } from "./handlers/httpResponseHandlers";
import { handleCreateInvite, handleDeleteInvite, handleGetInvites } from "./handlers/invitesHandlers";
import { handleLogout } from "./handlers/authenticateHandlers";

export const handler = async (event: SecuredLambdaEvent) => {
  const spotifyUserId = event.requestContext.authorizer.principalId;

  if ( !spotifyUserId ) return handle401Unauthorized(new Error('User not logged in'));

  if (event.resource.startsWith('/comparisons') && event.httpMethod === 'GET') {
    return await handleGetComparisons(event);
  } else if (event.resource.startsWith('/friends') && event.httpMethod === 'GET') {
    return await handleGetFriends(event);
  } else if (event.resource.startsWith('/invites')) {
    const httpMethod = event.httpMethod;
    switch (httpMethod) {
      case 'GET':
        return await handleGetInvites(event);
      case 'POST':
        return await handleCreateInvite(event);
      case 'DELETE':
        return await handleDeleteInvite(event);
    }
  } else if (event.resource === '/auth/logout' && event.httpMethod === 'GET') {
    return await handleLogout(event);
  }

  return handle404NotFound(new Error('Lambda entered with bad path'));
};