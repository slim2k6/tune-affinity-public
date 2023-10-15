import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from './secrets';




process.env.APEX_DOMAIN = 'tuneaffinity.com';
process.env.SUB_DOMAIN = 'test';

// AWS config
process.env.AWS_SDK_LOAD_CONFIG = '1';
const region = 'eu-north-1';
process.env.REGION = region;
process.env.AWS_PROFILE = 'tuneaffinity-dev';

process.env.SPOTIFY_CLIENT_ID = SPOTIFY_CLIENT_ID;
process.env.SPOTIFY_CLIENT_SECRET = SPOTIFY_CLIENT_SECRET;