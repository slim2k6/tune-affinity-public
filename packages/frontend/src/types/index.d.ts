export interface Friend {
  name: string;
  id: string;
}

export interface Invite {
  id: string;
  code: string;
}

export interface Track {
  id: string;
  name: string;
  sharedBy: string[];
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  sharedTracks: Track[];
}

export interface ComparisonResponse {
  message: string;
  data: Comparison | null;
}

export interface Comparison {
  updatedAt: string;
  sharedTracksByUser: Record<string, {name: string, artists: {id: string}[] }>;
  artistInfo: Record<string, {name: string, image: string }>;
  sharedTracksInfo: Record<string, Record<string, boolean>>;
}