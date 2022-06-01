import { useSession } from '../hooks/session';
import { useRouter } from 'next/router';
import { FC, FormEventHandler, useEffect, useState } from 'react';
import { Rate, SongRating } from '../types/rate';
import { baseSpotifyURL } from '../util/spotify';
import Button, { ButtonType } from './Button';
import SpotifyFrame from './SpotifyFrame';

const RateSongsForm: FC<{ data: Rate; id: string }> = ({ data, id }) => {
  const [rates, setRates] = useState<SongRating[]>(
    data.songs.map((song) => ({
      id: song.link,
      value: song.rating ?? 1,
    })),
  );
  const router = useRouter();

  const [session] = useSession();

  useEffect(() => {
    console.log(session, data.songs)
    if (!data.songs.map(song => song.submittedBy).includes(session?.user?.name ??"") && !session?.isAdmin) {
      router.replace("/")
    }
  }, [data.songs, session] )

  useEffect(() => {
    setRates(
      data.songs.map((song) => ({
        id: song.link,
        value: song.rating ?? 1,
      })),
    );
  }, [data.songs]);

  const submitForm: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    await submitRatings({ saveForLater: false });
  };

  const submitRatings = async ({ saveForLater }: { saveForLater: boolean }) => {
    if (id) {
      const response = await fetch(`/api/rates/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ rates, saveForLater }),
      });

      if (response.ok) {
        router.replace('/');
        return;
      }

      console.warn('failed updating');
    }
  };

  return (
    <main className="flex-col items-center self-center justify-center flex-1 w-full my-3">
      <div className="p-3 border-b">
        <h1 className="text-4xl text-center text-violet-500">{data.title}</h1>
        {data.playlist?.url ? (
          <div className="overflow-x-clip text-center">
            <a
              href={data.playlist.url}
              rel="nofollow noopener noreferrer"
              target="_blank"
              className="hover:text-blue-500 text-lg text-center text-blue-300 underline"
            >
              {data.playlist.url}
            </a>
          </div>
        ) : null}
      </div>
      <form onSubmit={submitForm}>
        {data.songs.map((song, index) => {
          const actualLink = `${baseSpotifyURL}/${song.link}`;
          return (
            <div
              key={`${actualLink} by ${song.submittedBy} ${index}`}
              className="flex flex-wrap items-center justify-between p-3 border-b"
            >
              <div className="flex items-center justify-center w-full">
                <SpotifyFrame id={song.link} />
              </div>
              <div className="w-full px-2">
                <div className="text-center text-orange-500">{rates[index]?.value}</div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.10}
                  value={rates[index]?.value ?? 1}
                  onChange={(event) => {
                    setRates(
                      rates.map((rating, ratingIndex) => {
                        if (ratingIndex !== index) {
                          return rating;
                        }
                        return {
                          id: rating.id,
                          value: event.target.valueAsNumber,
                        };
                      }),
                    );
                  }}
                  placeholder="10"
                  className="dark:bg-neutral-700 dark:text-white outline-0 flex w-full m-1 rounded-lg"
                />
              </div>
              <div className="overflow-x-clip w-full text-center">
                <a
                  href={actualLink}
                  rel="nofollow noopener noreferrer"
                  target="_blank"
                  className="hover:text-blue-500 w-1/3 text-blue-300 underline"
                >
                  {actualLink}
                </a>
              </div>
            </div>
          );
        })}
        <div className="justify-evenly flex my-3">
          <Button buttonType={ButtonType.Primary} label="Submit ratings" />
        </div>
      </form>
    </main>
  );
};

export default RateSongsForm;
