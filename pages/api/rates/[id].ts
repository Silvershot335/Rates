import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import admin from '../../../lib/firebase';
import { Playlist, Rate, Song, SongRating } from '../../../types/rate';
import { getIDFromLink, isSpotifyURL } from '../../../util/spotify';
import { Session, getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

async function getSongs(
  session: Session,
  songs: Song[],
  rates: SongRating[],
) {
  return songs.map(({ link, submittedBy }) => {
    return {
      link,
      submittedBy,
      rating:
        rates.find(
          (rate) => rate.id === link && rate.submittedBy === session.user?.name,
        )?.value ?? 1,
    };
  });
}

async function getRate(
  session: Session,
  id: string,
): Promise<Partial<Rate> & { success: boolean }> {
  const collection = admin.firestore().collection('rates');

  const data = (await collection.doc(id).get()).data();

  const songs: Song[] = data?.songs ?? { songs: [] };
  const count: number = data?.count ?? 0;
  const date: admin.firestore.Timestamp =
    data?.date ?? admin.firestore.Timestamp.now();
  const endDate: admin.firestore.Timestamp = data?.endDate ?? admin.firestore.Timestamp.now();
  const playlist: Playlist = data?.playlist ?? { id: '', url: '' };
  const rates: SongRating[] = data?.rates ?? [];
  const finishedRaters: string[] = data?.finishedRaters ?? [];
  const title: string = data?.title ?? '';

  if (count === 0) {
    return { success: false };
  }

  const now = admin.firestore.Timestamp.now();

  const submissionsOpen = date.toMillis() > now.toMillis();
  const ratingsOpen = endDate.toMillis() > now.toMillis();

  const submissions = await getSongs(
    session,
    songs,
    rates,
  );

  return {
    success: true,
    songs: submissions.map(({ link, submittedBy }) => ({
          link,
          submittedBy,
    })),
    title,
    count,
    date: date.toDate().toISOString(),
    playlist,
    isCompleted: !submissionsOpen && !ratingsOpen,
    rates: !ratingsOpen ? rates : [],
  };
}

async function submitSongsForRate(
  session: Session,
  inputSongs: string[],
  id: string,
) {
  const rates = admin.firestore().collection('rates');

  const data = (await rates.doc(id).get()).data();

  const songs: Song[] = data?.songs ?? [];
  const count: number = data?.count ?? 0;

  if (count === 0) {
    return { success: false };
  }

  if (inputSongs.every((song) => isSpotifyURL(song))) {
    const previouslySubmittedSongs = songs.filter(
      (song) => song.submittedBy !== session.user?.name,
    );
    const addingSongs = inputSongs.map((link) => ({
      link: getIDFromLink(link),
      submittedBy: session.user!.name!,
    }));

    const newSongs = [...previouslySubmittedSongs, ...addingSongs];

    await rates.doc(id).update({ songs: newSongs });

    return { success: true };
  }

  return { success: false };
}

async function addRatings(
  session: Session,
  ratings: { rates: SongRating[]; saveForLater: boolean },
  id: string,
) {
  const collection = admin.firestore().collection('rates');
  const document = await collection.doc(id).get();

  const rates: SongRating[] = document.data()?.rates ?? [];
  const finishedRaters: string[] = document.data()?.finishedRaters ?? [];

  const otherUserRatings = (rates ?? []).filter(
    (rate) => rate.submittedBy !== session.user?.name,
  );

  await collection.doc(id).update({
    finishedRaters: ratings.saveForLater
      ? finishedRaters
      : [...finishedRaters, session.user?.name],
    rates: [
      ...otherUserRatings,
      ...ratings.rates.map(
        (rating): SongRating => ({
          id: rating.id,
          submittedBy: session.user?.name!,
          value: rating.value,
        }),
      ),
    ],
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);
  console.log('id', session)

  if (!session) {
    res.status(401).json({
      error: 'Get Out!!!',
    });
    return;
  }

  const id = req.query?.id as string;
  if (!id) {
    res.status(500).json({
      error: 'Invalid ID',
      id,
    });
    return;
  }

  if (req.method === 'POST') {
    const result = await submitSongsForRate(session, req.body ?? [], id);
    res.status(200).json(result);
    return;
  }

  if (req.method === 'GET') {
    const { success, ...rates } = await getRate(session, id);
    if (success) {
      res.status(200).json(rates);
      return;
    }
    res.status(400).json({ success: false });
    return;
  }

  if (req.method === 'PUT') {
    await addRatings(
      session,
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body ?? { rates: [], saveForLater: false },
      id,
    );
    res.status(200).json({ success: true });
    return;
  }

  res.status(405).json({ error: 'Use GET/PUT/POST' });
}
