export const REGION = process.env.REGION!;

export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
export const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;

// export const STORAGE_USERS_NAME = process.env.STORAGE_USERS_NAME!;
// export const STORAGE_SESSIONS_NAME = process.env.STORAGE_SESSIONS_NAME!;
// export const STORAGE_INVITECODES_NAME = process.env.STORAGE_INVITECODES_NAME!;
// export const STORAGE_FRIENDS_NAME = process.env.STORAGE_FRIENDS_NAME!;
// export const STORAGE_OAUTHSTATE_NAME = process.env.STORAGE_OAUTHSTATE_NAME!;
// export const STORAGE_PLAYLISTS_NAME = process.env.STORAGE_PLAYLISTS_NAME!;
// export const STORAGE_USERTRACKSETS_NAME = process.env.STORAGE_USERTRACKSETS_NAME!;
// export const STORAGE_PROCESSLOCK_NAME = process.env.STORAGE_PROCESSLOCK_NAME!;
// export const STORAGE_COMPARISONS_NAME = process.env.STORAGE_COMPARISONS_NAME!;

export const FUNCTION_DOWNLOADSPOTIFYPLAYLISTS_NAME = process.env.FUNCTION_DOWNLOADSPOTIFYPLAYLISTS_NAME!;
export const FUNCTION_CREATECOMPARISON_NAME = process.env.FUNCTION_CREATECOMPARISON_NAME!;

export const APEX_DOMAIN = process.env.APEX_DOMAIN!;
export const SUB_DOMAIN = process.env.SUB_DOMAIN || '';
export const ENV_DOMAIN = ( SUB_DOMAIN.length > 0 ? SUB_DOMAIN + '.' : '' ) + APEX_DOMAIN;
export const API_BASE_URI = 'https://api.' + ENV_DOMAIN;
export const WEB_BASE_URI = 'https://www.' + ENV_DOMAIN;
export const COOKIE_SETTINGS = `Secure; HttpOnly; SameSite=Lax; Path=/; Domain=.${ENV_DOMAIN};`;
export const AUTHENTICATED_REDIRECT_URI = `${WEB_BASE_URI}/friends`;
export const SPOTIFY_REDIRECT_BACK_URI = `${API_BASE_URI}/auth/spotify/callback`;