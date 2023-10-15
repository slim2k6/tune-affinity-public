import { config, Lambda } from 'aws-sdk';
import { FUNCTION_DOWNLOADSPOTIFYPLAYLISTS_NAME, FUNCTION_CREATECOMPARISON_NAME, REGION } from './constants';

config.update({ region: REGION });
const lambda = new Lambda();

export async function invokeDownloadPlaylists(spotifyUserId: string) {
  const params = {
    FunctionName: FUNCTION_DOWNLOADSPOTIFYPLAYLISTS_NAME,
    InvocationType: 'Event',
    Payload: JSON.stringify({spotifyUserId}),
  };

  try {
    await lambda.invoke(params).promise();
    console.log("lambda invoked: " + FUNCTION_DOWNLOADSPOTIFYPLAYLISTS_NAME);
  } catch (error) {
    console.error('Error invoking DownloadPlaylists:', error);
  }
};

export const invokeCreateComparison = async (currentUserId: string, otherUsers: string[]) => {
  if (!currentUserId || !otherUsers || otherUsers.length === 0) {
    return Promise.reject("No current user or other users provided");
  }

  const params = {
    FunctionName: FUNCTION_CREATECOMPARISON_NAME,
    InvocationType: 'Event',
    Payload: JSON.stringify({initiatingUser: currentUserId, otherUsers}),
  };

  try {
    await lambda.invoke(params).promise();
  } catch (error) {
    console.error('Error invoking CreateComparison:', error);
  }
};