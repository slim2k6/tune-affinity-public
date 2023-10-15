# Goals:
- A Working in prod for invited friends
- B Clean code for public repo
- C Approved app by spotify
- D Smooth User Experience (websockets, login page, etc)

# Todo features / fix:
- bug for user M.A, from aws-sdk, probably dynamodb on some playlists: ValidationException: Item size has exceeded the maximum allowed size
- update prod stack to typescript. breaking changes in dynamo so must save data and restore after build
- Websockets for download & comparison updates
  - get event emitting working and just check the events in the frontend console
  - in top bar of all menu, show spinner with process name
  - friends page:
    - list of friends should include sync status, disable clicking on create comparison if not ready or error
    - change arrow to "Compare"-button
  - after login:
    - only download if it has been done before
    - only go to friends page if download is complete
    - go to download page if not complete
  - download page:
    - "Checking playlists"
    - "Total playlists to download"
    - Show a box for each playlist with total tracks as a number inside, box width should be = total tracks / 50 * standard width. Start out grey if not started yet. Then green when finished. If more than 1000 tracks, show update every 500(?)
  - comparison page:
- Spotify demands: C
  - Cookie policy
  - Scopes used
  - Data stored
  - ?? investigate more
    - [https://sortify.it/privacy](https://sortify.it/privacy)
    - [https://www.trackafind.com/](https://www.trackafind.com/)( -> about
    - [https://developer.spotify.com/terms](https://developer.spotify.com/terms)
- Session check on frontpage.
  - if sessionCookie -> show menu, else show login button
  - if get friends is 401, remove session cookie, redirect to frontpage    

# Nice todo:
- convert dyndamodb query to get operations when only getting one item
- backend integration tests in pipeline 
  - https://docs.aws.amazon.com/cdk/v2/guide/cdk_pipeline.html#cdk_pipeline_validation 
  - https://stackoverflow.com/questions/70541581/how-do-you-add-a-testing-stage-to-a-codepipeline-in-aws-cdk
- Redo test-data so it uses backend code to insert the data. Otherwise it might be injected incorrectly (UserTrackSets become a big string instead of list of strings)
- Add testing action / stage to pipeline
- lambda layer for node_modules instead of bundling with code + use NodejsFunction with reference to source code in cdk instead of a bundled file
- webpack config in ts instead of js
- upgrade to aws-sdk v3
- use spotify api package and their types instead or use fetch instead of axios
- fix typescript / webpack setup with tests and required secrets for aws/integration tests


# Tests:
- Can login and playlists are downloaded -> User not in db
- Can use invite code to become friends -> Exists other user with invite code
- Can create invite code -> POST invitecode
- Can get all invite codes -> exists 2 or more invite codes
- Can delete invite code? -> invite code exists, DELETE invitecode
- Can list friends
- Can remove friend?
- Can create comparison
- Can get comparison

