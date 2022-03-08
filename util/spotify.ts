export const isSpotifyURL = (song: string) => {
  const songHasLength = song?.length;
  if (songHasLength) {
    const songMatches = song?.match(
      /https:\/\/open.spotify.com\/track\/.+/,
    )?.length;

    return typeof songMatches === 'number';
  }
  return false;
};

const baseURL = 'https://open.spotify.com';

export const baseEmbedURL = `${baseURL}/embed/track`;

export const baseSpotifyURL = `${baseURL}/track`;

export const sampleSpotifyURL = `${baseSpotifyURL}/4cOdK2wGLETKBW3PvgPWqT`;
export const exampleSpotifyURL = `${baseSpotifyURL}/{songID}`;

export const baseAPI = 'https://api.spotify.com/v1';

// Add one for trailing /
const startIndex = baseSpotifyURL.length + 1;

export const getIDFromLink = (link: string): string =>
  link.includes('?')
    ? link.substring(startIndex, link.indexOf('?'))
    : link.substring(startIndex);
