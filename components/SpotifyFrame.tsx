import { FC } from 'react';
import { baseEmbedURL } from '../util/spotify';

const SpotifyFrame: FC<{ id: string }> = ({ id }) => {
  if (!id) {
    return null;
  }

  return (
    <iframe
      style={{ borderRadius: '12px' }}
      src={`${baseEmbedURL}/${id}`}
      width="300"
      height="80"
      frameBorder="0"
      allow="clipboard-write; encypted-media; fullscreen; picture-in-picture"
    />
  );
};

export default SpotifyFrame;
