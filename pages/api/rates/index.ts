import { NextApiRequest, NextApiResponse } from 'next';
import { Session, getServerSession } from 'next-auth';
import admin from '../../../lib/firebase';
import { Rate, Song } from '../../../types/rate';
import { SessionWithToken } from '../../../types/session';
import { join } from '../../../util/string';
import { useSession } from 'next-auth/react';
import { authOptions } from '../auth/[...nextauth]';

type Timestamp = admin.firestore.Timestamp;

const now = (): Timestamp => admin.firestore.Timestamp.now();

async function createRate({
  title,
  count,
  date: dateString,
  endDate: endDateString
}: Required<Rate>): Promise<{
  status: string;
  data: Rate | string;
}> {
  if (!title || !count || !dateString || !endDateString) {
    return {
      status: 'Invalid body',
      data: { title, count, date: dateString, endDate: endDateString } as Rate,
    };
  }

  const rates = admin.firestore().collection('rates');

  const matchingTitles = await rates.where('title', '==', title).get();

  if (!matchingTitles.empty) {
    return {
      status: 'Duplicate document',
      data: { title, count, date: dateString } as Rate,
    };
  }

  const date = admin.firestore.Timestamp.fromDate(new Date(dateString));
  const endDate = admin.firestore.Timestamp.fromDate(new Date(endDateString));
  const doc = await rates.add({
    title,
    count,
    date,
    endDate,
    songs: [],
    playlist: {
      id: '',
      url: '',
    },
    finishedRaters: [],
  });

  return { status: 'Success', data: doc.id };
}

const sortDocuments = (
  a: admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>,
  b: admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>,
): number => {
  const rightNow = now();
  const aDate: Timestamp = a.data()?.date ?? rightNow;

  const bDate: Timestamp = b.data()?.date ?? rightNow;

  const aMilliseconds = aDate.toMillis();
  const bMilliseconds = bDate.toMillis();

  if (
    aMilliseconds > rightNow.toMillis() &&
    bMilliseconds > rightNow.toMillis()
  ) {
    return aDate.toMillis() - bDate.toMillis();
  }
  if (
    aMilliseconds > rightNow.toMillis() &&
    bMilliseconds < rightNow.toMillis()
  ) {
    return aMilliseconds;
  }
  if (
    aMilliseconds < rightNow.toMillis() &&
    bMilliseconds > rightNow.toMillis()
  ) {
    return bMilliseconds;
  }
  return 0;
};

async function getRates(session: Session) {
  const rates = admin.firestore().collection('rates');

  const futureRates = await rates.where('date', '>', now()).get();

  const participatedInRates = (
    await rates.where('date', '<=', now()).get()
  ).docs.filter((doc) => {
    const songs: Song[] = doc.data()?.songs ?? [];
    return (
      songs.findIndex((song) => song.submittedBy === session.user?.name) !== -1
    );
  });

  return [...futureRates.docs, ...participatedInRates]
    .sort((a, b) => sortDocuments(a, b))
    .map((document) => {
      const data = document.data();
      const count: number = data?.count ?? 0;

      if (count === 0 || !data) {
        return null;
      }

      const title: string = data.title ?? '';
      const date: admin.firestore.Timestamp = data.date;
      const songs: Song[] = data?.songs ?? [];

      const finishedRaters: string[] = data?.finishedRaters ?? [];
      const allRaters = [...new Set(songs.map((song) => song.submittedBy))];

      const allHaveRated =
        (
          finishedRaters.every((rater) => allRaters.includes(rater)) &&
          allRaters.every((rater) => finishedRaters.includes(rater))
        ) || (
          data.endDate && data.endDate?.toMillis() < admin.firestore.Timestamp.now().toMillis()
        );

      const youRated = finishedRaters.includes(session.user?.name!);

      const waitingFor = allRaters.filter(
        (rater) =>
          !finishedRaters.includes(rater) && rater !== session.user?.name,
      );

      return {
        id: document.id,
        title,
        count,
        date: date?.toDate().toISOString(),
        songs: [...new Set(songs.map((song: Song) => song.submittedBy))],
        waiting: allHaveRated
          ? 'Rate complete!'
          : `Waiting on ${
              finishedRaters.length === 0
                ? 'Everyone'
                : youRated
                ? join(waitingFor)
                : waitingFor.length
                ? join([...waitingFor, 'You'])
                : 'You'
            }`,
      };
    })
    .filter((document) => !!document);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);
  console.log('blah', session);

  if (!session) {
    res.status(401).json({
      error: 'You Shall Not Pass',
    });
    return;
  }

  if (req.method === 'POST') {
    const { status, data } = await createRate({
      title: req.body?.title ?? '',
      count: req.body?.count ?? 0,
      date: req.body?.date ?? '',
      endDate: req.body?.endDate ?? '',
    } as Required<Rate>);
    if (status === 'Success') {
      res.status(201).json({ id: data });
      return;
    }
    res.status(400).json({
      error: status,
      sent: data,
    });
    return;
  }

  if (req.method === 'GET') {
    const rates = await getRates(session);
    res.status(200).json(rates);
    return;
  }

  res.status(405).json({ error: 'Use POST/GET' });
}
