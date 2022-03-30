import type { FC } from 'react';
import type { Rate, Song } from '../types/rate';
import SpotifyFrame from './SpotifyFrame';

function calculateRankings(songs: Song[]) {
  const usernames = [...new Set(songs.map((song) => song.submittedBy))];

  const userScores = usernames.map((username) => {
    const userSongs = songs.filter((song) => song.submittedBy === username);
    const userSum = userSongs.reduce(
      (previous, current) => previous + current.rating!,
      0,
    );
    return {
      username,
      value: userSum / userSongs.length,
    };
  });

  return userScores.sort((a, b) => b.value - a.value);
}

const ResultsForm: FC<{ data: Rate; id: string }> = ({ data }) => {
  const scores = [...new Set(data.songs.map((song) => song.link))]
    .map((id) => {
      const ratingsForSong = data.rates.filter((rating) => rating.id === id);
      return {
        link: id,
        rating:
          ratingsForSong.reduce(
            (previous, current) => previous + current.value,
            0,
          ) / ratingsForSong.length,
        submittedBy: data.songs.find((song) => song.link === id)!.submittedBy,
      };
    })
    .sort((a, b) => b.rating - a.rating);

  const bestSong = scores[0];
  const worstSong = scores[scores.length - 1];

  const userRankings = calculateRankings(scores);

  return (
    <div>
      <div className="p-3 border-b">
        <h1 className="text-2xl text-center text-orange-500">Song Rates for {data.title}</h1>
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
      <div className="flex flex-wrap p-4 border-b  justify-center">
        <div className="mr-4">
          <div className="my-2 text-blue-500">Best Song: </div>
          <SpotifyFrame id={bestSong.link} />
        </div>
        <div>
          <div className="my-2 text-red-500">Worst Song: </div>
          <SpotifyFrame id={worstSong.link} />
        </div>
      </div>
      <div className="flex p-4">
        <ol className="w-full">
          <div className="text-center text-lg text-orange-500">Rankings:</div>
          {userRankings.map((ranking, index) => (
            <li key={ranking.username} className="pl-3 text-center">
              {index + 1}. {ranking.username} - {ranking.value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}
            </li>
          ))}
        </ol>
      </div>
      {[...new Set(scores.map((score) => score.link))].map((id) => {
        const song = scores.find((score) => score.link === id)!;
        const ratesForSong = data.rates.filter((rating) => rating.id === id);
        const average =
          ratesForSong.reduce(
            (previous, current) => previous + current.value,
            0,
          ) / ratesForSong.length;
        return (
          <div key={id} className="flex flex-wrap p-3 border-t">
            <div className="flex flex-wrap w-full">
              <div className="sm:w-auto w-full pt-2">
                <SpotifyFrame id={id} />
              </div>
              <div className="flex flex-col px-3 pt-2">
                <div className='dark:text-cyan-500 text-blue-800'>Submitted by {song.submittedBy}</div>
                <div className='dark:text-orange-500 text-orange-700' >Average rating: {average.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}</div>
              </div>
            </div>
            <div className="justify-left flex flex-wrap w-full pt-8 dark:text-slate-200">
              {data.rates
                .filter((rating) => rating.id === id)
                .map((rating) => (
                  <div
                    key={`${rating.submittedBy} - ${rating.value}`}
                    className="lg:w-1/6 md:w-1/3 w-1/2"
                  >
                    {rating.submittedBy} - {rating.value}
                  </div>
                ))}
            </div>
          </div>
        );
      })}

      {/* <pre>{JSON.stringify(data, null, 4)}</pre> */}
    </div>
  );
};

export default ResultsForm;
