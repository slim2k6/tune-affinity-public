import * as Session from '../../db/session';
import { authorizedHTTPActions } from '../../authorizedHTTPActions';

export async function authorizeSession (event: AuthorizerLambdaEvent, context: LambdaContext, callback: LambdaCallback) {
  const cookieHeader = event.authorizationToken;
  const methodArn = event.methodArn;

  const sessionId = getCookieValue('session', cookieHeader);

  console.info(event, sessionId);
  if (!sessionId || sessionId === '') {
    callback("Unauthorized");
    return;
  }

  try {
    const session = await Session.getSession(sessionId);

    if (!session) {
      callback("Unauthorized");
      return;
    }

    const principalId = session.spotifyUserId;

    const resources = generateResources(methodArn!);

    if (!session.expiresAt || session.expiresAt * 1000 < Date.now()) {
      callback(null, generatePolicy(principalId, 'Deny', resources));
      return;
    }

    if (principalId) {
      callback(null, generatePolicy(principalId, 'Allow', resources));
    }
  } catch (error) {
    console.error(error);
    callback('Error: Invalid token');
  }
};

function getCookieValue(cookieName: string, cookieHeader: string) {
  const cookies = cookieHeader.split('; ');
  for (let i = 0; i < cookies.length; i++) {
    const cookiePair = cookies[i].split('=');
    if (cookiePair[0] === cookieName) {
      return cookiePair[1];
    }
  }
  return null;
}

function generatePolicy(principalId: string, effect: string, resources: string[]) {
  const authResponse = {
    principalId: principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: resources.map(resource => {
        return {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        };
      }),
    },
  }

  return authResponse;
}

function generateResources(methodArn: string): string[] {
  const arnParts = methodArn.split(':');
  const apiIdStageMethod = arnParts[5].split('/');

  const arnData = {
    region: arnParts[3],
    accountId: arnParts[4],
    apiId: apiIdStageMethod[0],
    stage: apiIdStageMethod[1],
  }

  const resources = authorizedHTTPActions.map(action => {
    return `arn:aws:execute-api:${arnData.region}:${arnData.accountId}:${arnData.apiId}/${arnData.stage}/${action}`;
  });

  return resources
}