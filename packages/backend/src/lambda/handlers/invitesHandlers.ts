import { getInvites, createInvite, deleteInvite } from '../../model/invites';
import { handle500ServerError, handle200OK, handle201Created, handle400BadRequest } from './httpResponseHandlers';

const allowMethods = "GET, POST, DELETE, OPTIONS";

export async function handleGetInvites(event: SecuredLambdaEvent) {
  const spotifyUserId = event.requestContext.authorizer.principalId;

  try {
    const invites = await getInvites(spotifyUserId);
    return handle200OK(allowMethods, invites);
  } catch (error) {
    return handle500ServerError(error, 'Error getting invites');
  }
}

export async function handleCreateInvite(event: SecuredLambdaEvent) {
  const spotifyUserId = event.requestContext.authorizer.principalId;

  try {
    const inviteCode = await createInvite(spotifyUserId);
    return handle201Created(allowMethods, inviteCode);
  } catch (error) {
    return handle500ServerError(error, 'Error creating invite');
  }
}

export async function handleDeleteInvite(event: SecuredLambdaEvent) {
  const spotifyUserId = event.requestContext.authorizer.principalId;
  const inviteCode = event.pathParameters ? event.pathParameters.inviteCode : null;

  if (inviteCode) { 
    try {
      await deleteInvite(spotifyUserId, inviteCode);
      return handle200OK(allowMethods, null);
    } catch (error) {
      return handle500ServerError(error, 'Error deleting invite');
    }
  } else {
    const msg = 'Invite code is required for DELETE request.';
    return handle400BadRequest(new Error(msg), msg);
  }
}