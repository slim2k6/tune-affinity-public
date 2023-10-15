interface LambdaEvent {
  requestContext: RequestContext;
  queryStringParameters: { [key: string]: string };
  headers: LambdaHeaders;
  pathParameters?: { [key: string]: string };
  resource: string;
  httpMethod: string;
}

interface SecuredLambdaEvent extends LambdaEvent {
  requestContext: AuthorizedRequestContext;
}

interface AuthorizerLambdaEvent extends LambdaEvent {
  authorizationToken: string;
  methodArn?: string;
}

interface LambdaHeaders {
  Cookie: string;
}

interface RequestContext {
  identity: Identity;
}

interface AuthorizedRequestContext extends RequestContext {
  authorizer: Authorizer;
}

interface Authorizer {
  principalId: string;
}

interface Identity {
  sourceIp: string;
}

interface LambdaContext {
  getRemainingTimeInMillis: () => number;
}

type LambdaCallback = (errorString: string | null, policy?: any) => void;

interface CreateComparisonEvent {
  initiatingUser: string;
  otherUsers: string[];
}

interface DownloadPlaylistsEvent {
  spotifyUserId: string;
}
