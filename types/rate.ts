export interface Rate {
  id: string;

  title: string;
  count: number;
  date: string;
  endDate: string;

  songs: Song[];
  playlist: Playlist;

  rates: SongRating[];

  isCompleted: boolean;

  waiting: string;
}

export interface Playlist {
  url: string;
  id: string;
}

export interface Song {
  link: string;
  submittedBy: string;
  trackName?: string;
  artist?: string;
  rating?: number;
}

export interface SongRating {
  id: string;
  value: number;
  submittedBy?: string;
}
