import { authorizeSession } from "./handlers/authorizeHandlers";

export const handler = async (event: AuthorizerLambdaEvent, context: LambdaContext, callback: LambdaCallback) => {
  return await authorizeSession(event, context, callback);
};