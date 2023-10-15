import { compareUsers, cleanUpCreateComparison } from "../model/createComparison";
import { UserError, ProcessLockError } from "../model/errors";

export const handler = async (event: CreateComparisonEvent, context: LambdaContext) => {
  const initiatingUser = event.initiatingUser;
  const otherUsers = event.otherUsers || [];

  try {
    const remainingTime = context.getRemainingTimeInMillis() - 1000;
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('Timeout'), remainingTime));
    const comparisonPromise = compareUsers(initiatingUser, otherUsers);

    await Promise.race([timeoutPromise, comparisonPromise]); // work must complete before lambda times out so we can end the process gracefully
  } catch (error) {
    if (error === 'Timeout') {
      console.warn('Timeout while comparing playlists');
    } else if (error instanceof ProcessLockError || error instanceof UserError) {
      console.warn(error.message);
    } else {
      console.error('Error while comparing playlists:', error);
    }
  } finally {
    await cleanUpCreateComparison(initiatingUser, otherUsers);
  }
};
