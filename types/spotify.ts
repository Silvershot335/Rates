export interface Track {
  album: Album;
  artists: Artists[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: ExternalIDs;
  external_urls: ExternalURLs;
  href: string;
  id: string;
  is_playable: boolean;
  restrictions: Restrictions;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}

interface ExternalIDs {
  /** International Standard Recording Code */
  isrc: string;
  /** International Article Number */
  ean: string;
  /** Universal Product Code */
  upc: string;
}

interface Image {
  url: string;
  height: number;
  width: number;
}

interface ExternalURLs {
  spotify: string;
}

interface Restrictions {
  reason: string;
}

interface AlbumArtist {
  external_urls: ExternalURLs;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

interface Followers {
  href: string;
  total: number;
}

export interface Album {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: ExternalURLs;
  href: string;
  id: string;
  images: Image[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
  release_date: string;
  release_date_precision: string;
  restrictions?: Restrictions;
  album_group: string;
  artists: AlbumArtist[];
}

export interface Artists {
  external_urls: ExternalURLs;
  followers: Followers;
  genres: string[];
  href: string;
  id: string;
  images: Image[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
}
