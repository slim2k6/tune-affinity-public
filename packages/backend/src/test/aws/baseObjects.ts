export const baseEvent : LambdaEvent = {
  requestContext: {
    identity: {
      sourceIp: '',
    },
  },
  queryStringParameters: {},
  headers: {
    Cookie: '',
  },
  resource: '',
  httpMethod: '',
};

const fifteenMinutesInMillis = 15 * 60 * 1000;
export const baseLambdaContext : LambdaContext = {
  getRemainingTimeInMillis: () => fifteenMinutesInMillis,
};