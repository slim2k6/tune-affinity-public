import axios, { AxiosInstance } from 'axios';
// import querystring from 'querystring';

import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "./constants";

export function getAuthRedirectUrl(appRedirectBackUri: string, state: string): string {
  if (!appRedirectBackUri) throw new Error('Missing appRedirectBackUri');
  if (!state) throw new Error('Missing state');

  const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';

  const searchParams = new URLSearchParams();
  searchParams.append('response_type', 'code');
  searchParams.append('client_id', SPOTIFY_CLIENT_ID);
  searchParams.append('scope', scope);
  searchParams.append('redirect_uri', appRedirectBackUri);
  searchParams.append('state', state);

  return `https://accounts.spotify.com/authorize?${searchParams}`;
}

export async function requestAccessToken(code: string, appRedirectBackUri: string) {
  if (!code) throw new Error('Missing code');
  if (!appRedirectBackUri) throw new Error('Missing appRedirectBackUri');

  const searchParams = new URLSearchParams();
  searchParams.append('code', code);
  searchParams.append('redirect_uri', appRedirectBackUri);
  searchParams.append('grant_type', 'authorization_code');

  const tokenResponse = await axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: searchParams,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
    }
  });  

  const accessToken = tokenResponse.data.access_token;
  const refreshToken = tokenResponse.data.refresh_token;

  return { accessToken, refreshToken };
}

export interface User {
  spotifyUserId: string;
  name: string;
  href: string;
  image: string;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  href: string;
  images: Image[];
}

export async function getSpotifyUser(accessToken: string): Promise<User> {
  if (!accessToken) throw new Error('Missing accessToken');

  const userResponse = await axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });

  return {
    spotifyUserId: userResponse.data.id,
    name: userResponse.data.display_name,
    href: userResponse.data.href,
    image: chooseSmallestImage(userResponse.data.images, 56)
  };
}

export async function getSpotifyApiInstance(refreshToken: string): Promise<AxiosInstance> {
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    {
      headers: {
        'Authorization': `Basic ${Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

  const accessToken = response.data.access_token;
  const instance = axios.create({ baseURL: 'https://api.spotify.com/v1', headers: { 'Authorization': `Bearer ${accessToken}` } });
  instance.interceptors.response.use(null, async (error) => {
    if (error.response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, parseInt(error.response.headers['retry-after']) * 1000));
      return instance.request(error.config);
    }
    return Promise.reject(error);
  });
  return instance;
}

export interface Playlist {
  id: string;
  name: string;
  snapshotId: string;
  type: string;
  tracks: { href: string, total: number };
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  snapshot_id: string;
  type: string;
  tracks: { href: string, total: number };
}

export async function getAllPlaylists(spotifyApi: AxiosInstance): Promise<Playlist[]> {

  // emit checking playlists

  let playlists: Playlist[] = [];
  let nextUrl = '/me/playlists?limit=50';
  while (nextUrl) {
    const response = await spotifyApi.get(nextUrl);
    // at first response, emit response.data.total which is number of playlists to download
    const filteredPlaylists: Playlist[] = response.data.items.map((item: SpotifyPlaylist) => {
      return {
        id: item.id,
        name: item.name,
        snapshotId: item.snapshot_id,
        type: item.type,
        tracks: item.tracks
      };
    });
    playlists.push(...filteredPlaylists);
    nextUrl = response.data.next;
  }
  return playlists;

  // emit playlist ids of all playlists so we can check which has been completed later
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string }[];
}

export interface SpotifyPlaylistTrack {
  track: SpotifyTrack;
  is_local: boolean;
}

export async function getAllTrackIds(spotifyApi: AxiosInstance, playlist: Playlist): Promise<string[]> {
  let trackIds: string[] = [];
  let nextUrl = playlist.tracks.href + '?limit=50';
  
  console.log(playlist.name, playlist.tracks.total)

  while (nextUrl) {
    // if total tracks more than 250, emit total tracks and playlist id
    const response = await spotifyApi.get(nextUrl);
    // const nonLocalTracks = response.data.items.filter((item: SpotifyPlaylistTrack) => item.is_local === false);
    // const ids: string[] = nonLocalTracks.map((item: SpotifyPlaylistTrack) => item.track.id);

    // console.log(response.data.items[0]);
    // console.log(!response.data.items[0].is_local);
    // console.log(response.data.items[0].track ? true : false);
    // console.log(response.data.items[0].track.id ? true : false);
    const filteredTracks = response.data.items.filter((item: SpotifyPlaylistTrack) => {
      return !item.is_local &&
      item.track && // can happen if track was removed from spotify library
      item.track.id; // must have id!
    });

    // console.log(filteredTracks.length);
    
    const ids: string[] = filteredTracks.map((item: SpotifyPlaylistTrack) => item.track.id);
    trackIds.push(...ids);
    nextUrl = response.data.next;
  }
  // console.log(playlist.name, playlist.tracks.total, trackIds.length)
  // emit playlist id so we can check it of
  return trackIds;
}

export interface SimplifiedTrack {
  name: string;
  artists: { id: string }[];
}

export interface Track extends SimplifiedTrack {
  id: string;
  name: string;
  artists: { id: string }[];
}

export async function fetchTracksInfo(trackIds: string[], spotifyApi: AxiosInstance): Promise<Map<string, SimplifiedTrack>> {
  const batchSize = 50;
  const tracksMap = new Map<string, SimplifiedTrack>();

  for (let i = 0; i < trackIds.length; i += batchSize) {
    const batchIds = trackIds.slice(i, i + batchSize);
    const response = await spotifyApi.get('/tracks', {
      params: {
        ids: batchIds.join(','),
      },
    });

    const simplifiedTracks: Track[] = response.data.tracks.map((track: SpotifyTrack) => {
      return {
        id: track.id,
        name: track.name,
        artists: track.artists.map(artist => ({
          id: artist.id
        }))
      };
    });

    simplifiedTracks.forEach(track => {
      tracksMap.set(track.id, {
        name: track.name,
        artists: track.artists
      });
    });
  }

  return tracksMap;
}
export interface Image {
  width: number;
  height: number;
  url: string;
}
interface SpotifyArtist {
  id: string;
  name: string;
  images: Image[];
}

export interface SimplifiedArtist {
  name: string;
  image: string;
}

interface Artist extends SimplifiedArtist {
  id: string;
}

export async function fetchArtistsInfo(sharedTracksInfoMap: Map<string, SimplifiedTrack>, spotifyApi: AxiosInstance): Promise<Map<string, SimplifiedArtist>> {
  const artistIds = Array.from(
    new Set(
      Array.from(sharedTracksInfoMap.values()).flatMap((track) =>
        track.artists.map((artist) => artist.id)
      )
    )
  );
  const batchSize = 50;
  const artistsMap = new Map<string, { name: string, image: string }>();

  for (let i = 0; i < artistIds.length; i += batchSize) {
    const batchIds = artistIds.slice(i, i + batchSize);
    const response = await spotifyApi.get('/artists', {
      params: {
        ids: batchIds.join(','),
      },
    });

    const simplifiedArtists = response.data.artists.map((artist: SpotifyArtist) => {
      return {
        id: artist.id,
        name: artist.name,
        image: chooseSmallestImage(artist.images, 56),
      };
    });

    simplifiedArtists.forEach((artist: Artist) => {
      artistsMap.set(artist.id, {
        name: artist.name,
        image: artist.image,
      });
    });
  }

  return artistsMap;
}


export function chooseSmallestImage(images: Image[], minSize: number): string {
  const smallestImage = images
    .filter(image => image.width >= minSize && image.height >= minSize)
    .reduce((smallest, image) => {
      if (!smallest || (image.width < smallest.width && image.height < smallest.height)) {
        return image;
      }
      return smallest;
    }, { 
      width: Number.MAX_SAFE_INTEGER,
      height: Number.MAX_SAFE_INTEGER,
      url: '',
    });
  return smallestImage ? smallestImage.url : '';
}