import { useRouter } from 'next/router';
import { FC } from 'react';
import useSWR from 'swr';
import AddSongsForm from '../../components/AddSongsForm';
import LoadingScreen from '../../components/LoadingScreen';
import RateSongsForm from '../../components/RateSongsForm';
import ResultsForm from '../../components/ResultsForm';
import { Rate } from '../../types/rate';

const SpecificRate: FC = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const { data } = useSWR<Rate>(`/api/rates/${id}`, (url) =>
    id
      ? fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }).then((res) => res.json())
      : Promise.resolve(),
  );

  if (!data) {
    return <LoadingScreen />;
  }

  const submissionDeadline = new Date(data.date);

  const today = new Date();

  const canSubmitSongs = submissionDeadline.valueOf() > today.valueOf();

  if (canSubmitSongs) {
    return <AddSongsForm data={data} id={id} />;
  } else if (data.isCompleted) {
    return <ResultsForm data={data} id={id} />;
  } else {
    return <RateSongsForm data={data} id={id} />;
  }
};

export default SpecificRate;
