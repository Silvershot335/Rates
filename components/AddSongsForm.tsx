import { useRouter } from 'next/router';
import { FC, FormEventHandler, useEffect, useState } from 'react';
import { Rate } from '../types/rate';
import {
  baseSpotifyURL,
  exampleSpotifyURL,
  getIDFromLink,
  isSpotifyURL,
  sampleSpotifyURL,
} from '../util/spotify';
import Button, { ButtonType } from './Button';
import SpotifyFrame from './SpotifyFrame';

const AddSongsForm: FC<{ data: Rate; id: string }> = ({ data, id }) => {
  const [valid, setValid] = useState(true);
  const [inputs, setInputs] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getResults = () => {
      if (data.songs.length === data.count) {
        return data.songs.map((song) => song.link);
      } else {
        const result = [];
        for (const song of data.songs) {
          result.push(song.link);
        }
        for (let i = result.length; i < data.count; ++i) {
          result.push('');
        }
        return result;
      }
    };

    setInputs(
      getResults().map((song) => (song ? `${baseSpotifyURL}/${song}` : '')),
    );
  }, [data]);

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);

    const songs = Array.from(new Array(data.count ?? 3)).map(
      (_, index) => formData.get(`song-${index}`)?.toString() ?? '',
    );

    const songsToSubmit = songs.filter((song) => !!song.length);

    if (
      songsToSubmit.every((song) => isSpotifyURL(song)) &&
      songsToSubmit.length !== 0
    ) {
      const response = await fetch(`/api/rates/${id}`, {
        method: 'POST',
        body: JSON.stringify([
          ...new Set(
            songsToSubmit.map((song) =>
              song.includes('?') ? song.substring(0, song.indexOf('?')) : song,
            ),
          ),
        ]),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.replace('/');
      } else {
        console.warn('oops', await response.json());
      }
    } else {
      setValid(false);
    }
  };

  return (
    <main className="lg:w-1/2 flex-col items-center self-center justify-center flex-1 w-full m-3">
      <h1 className="text-2xl text-center">Submit songs</h1>
      <form onSubmit={handleFormSubmit}>
        {inputs.map((input, index) => {
          const id = `song-${index}`;
          const validSpotifyURL = isSpotifyURL(input);
          const invalidInput = !valid && !validSpotifyURL;
          return (
            <div key={index} className="lg:mx-0 mx-3">
              <div className="flex items-center justify-between">
                <label htmlFor={id} className="flex px-2 py-1">
                  Song {index + 1}
                </label>
              </div>
              <input
                type="text"
                id={id}
                name={id}
                value={input}
                onChange={(event) => {
                  const newString = (event.target as HTMLInputElement).value;
                  setInputs(
                    inputs.map((previous, inputIndex) => {
                      if (index === inputIndex) {
                        return newString;
                      } else {
                        return previous;
                      }
                    }),
                  );
                }}
                placeholder={sampleSpotifyURL}
                autoComplete="off"
                className={`dark:bg-neutral-700 dark:text-white rounded-lg p-1 px-2 flex outline-0 w-full ${
                  invalidInput ? 'ring-2 ring-red-500' : ''
                }`}
              />

              <SpotifyFrame id={validSpotifyURL ? getIDFromLink(input) : ''} />

              {input.length && invalidInput && !validSpotifyURL ? (
                <div className="py-1 text-red-500">
                  Link must match url: {exampleSpotifyURL}
                </div>
              ) : null}
            </div>
          );
        })}
        <div className="flex justify-center">
          <Button buttonType={ButtonType.Primary} label="Submit" />
        </div>
      </form>
    </main>
  );
};

export default AddSongsForm;
