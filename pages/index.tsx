import { differenceInCalendarDays, format } from 'date-fns';
import Link from 'next/link';
import { MdDone } from 'react-icons/md';
import useSWR from 'swr';
import LoadingScreen from '../components/LoadingScreen';
import { useSession } from '../hooks/session';
import { Rate } from '../types/rate';

type HomePageRate = Omit<Rate, 'songs'> & { songs: string[] };

enum Stages {
  Submit = 'Submitting Songs',
  Rate = 'Rating Songs',
  Complete = 'Rate over!',
}

export default function Index() {
  const { data } = useSWR<HomePageRate[]>('/api/rates', (url) =>
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json()),
  );
  const [session] = useSession();

  if (!data) {
    return <LoadingScreen />;
  }

  const rates = data ?? [];

  const today = new Date();

  return (
    <main>
      <div className="flex flex-wrap overflow-y-scroll">
        {rates.map((rate) => {
          const submitDate = new Date(rate.date);
          const members = [...new Set(rate.songs)];

          const canSubmit = submitDate.valueOf() > Date.now();
          const canRate = rate.waiting !== 'Rate complete!';

          const daysUntilSubmitDate = differenceInCalendarDays(
            submitDate,
            today,
          );

          const stage = canSubmit
            ? Stages.Submit
            : canRate
            ? Stages.Rate
            : Stages.Complete;

          return (
            <Link className='block w-1/2' key={rate.id} href={`/rate/${rate.id}`}>
                <div
                  className={`${
                    stage === Stages.Submit
                      ? 'bg-[#af87ff] dark:bg-inherit dark: bg-neutral-800'
                      : stage === Stages.Rate
                      ? 'bg-blue-700 text-white'
                      : 'bg-emerald-700'
                  } flex flex-col h-48 p-3 pt-0 m-3 overflow-y-auto rounded-lg border border-neutral-400 dark:border-neutral-500`}
                >
                  <div
                    className={`${
                      stage === Stages.Rate ? 'border-white' : 'border-black'
                    } px-3 py-1 -mx-3 border-b`}
                  >
                    <div className="flex items-center justify-center">
                      <h3 className="text-2xl text-sky-500">{rate.title}</h3>
                    </div>
                    <div className="flex items-center justify-between text-sky-400">
                      <div>
                        {stage === Stages.Submit
                          ? 'Submitting Songs'
                          : stage === Stages.Rate
                          ? 'Rating Songs'
                          : 'Rate over!'
                          }
          
                      </div>
                      
                      {stage === Stages.Submit ? (
                        <div className='text-orange-400' >{format(submitDate, 'EEEE, MMMM dd, yyyy')}
                        </div>
                      ) : null}
                    </div>
                    
                  </div>
                  {stage === Stages.Submit || stage === Stages.Rate ? (
                    <div
                      className={`${
                        stage === Stages.Rate ? 'border-white' : 'border-black'
                      } flex items-center justify-between px-3 py-1 -mx-3 border-b`}
                    >
                      
                      { members.includes(session!.user!.name!) && stage === Stages.Submit ? (
                        <div className="flex items-center">
                          <div className="italic text-green-500">Signed up!</div>
                          <MdDone />
                        </div>
                      ) : stage === Stages.Rate ? (
                        <div>{rate.waiting}</div>
                      ) : <div />}
                      {stage === Stages.Submit ? (
                        <div className='text-orange-400'>
                          {daysUntilSubmitDate} Days until Submission Deadline
                          
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="text-cyan-400">{members.length} Raters Signed Up:</div>
                  <div className="flex flex-wrap justify-between">
                    {members.map((member) => (
                      <div className="w-1/3 text-slate-50" key={member}>
                        {member}
                      </div>
                    ))}
                  </div>
                </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
