import { handler } from '../../lambda/unsecuredRoutes';
import { baseEvent } from './baseObjects';


jest.setTimeout(10000);
describe("handleSpotifyLogin", () => {
  test("without invite code", async () => {
    const event = JSON.parse(JSON.stringify(baseEvent));
    event.resource = '/auth/spotify/login';
    event.httpMethod = 'GET';
    event.requestContext.identity.sourceIp = 'testIp'

    const result = await handler(event);
    expect(result.statusCode).toEqual(302);
  });
});