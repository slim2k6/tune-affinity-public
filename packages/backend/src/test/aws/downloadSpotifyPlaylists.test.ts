import * as User from '../../db/user';
import { handler } from '../../lambda/downloadSpotifyPlaylists';
import { baseLambdaContext } from './baseObjects';
import { DOWNLOAD_TEST_USER_ID } from '../secrets';

jest.setTimeout(baseLambdaContext.getRemainingTimeInMillis() - 1000);
describe("downloadPlaylists", () => {
  test("userWithRemovedTracks", async () => {
    const spotifyUserId = DOWNLOAD_TEST_USER_ID;
    const event = { spotifyUserId };

    await handler(event, baseLambdaContext);

    const user = await User.getUser(spotifyUserId);
    expect(user).not.toBeNull();
    expect(user!.lastSync.endCode).toEqual(User.LAST_SYNC_END_CODE_SUCCESS);
  });
});