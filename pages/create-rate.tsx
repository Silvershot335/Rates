import { add, addWeeks, format, nextFriday } from 'date-fns';
import { useRouter } from 'next/router';
import { FC, FormEventHandler, useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import Button, { ButtonType } from '../components/Button';
import LoadingScreen from '../components/LoadingScreen';
import { useSession } from '../hooks/session';

interface InputProps {
  label: string;
  id: string;
  name: string;
  placeholder?: string;
  invalid?: boolean;
  setInvalid?: (value: boolean) => void;
  min?: number;
  max?: number;
}

const Input: FC<InputProps> = ({
  label,
  id,
  name,
  placeholder,
  invalid,
  setInvalid,
  min,
  max,
}) => {
  return (
    <>
      <label htmlFor={id} className="flex px-2 py-1">
        {label}
      </label>
      <input
        type={min ? 'number' : 'text'}
        id={id}
        name={name}
        placeholder={placeholder ?? label}
        autoComplete="off"
        className={`dark:bg-neutral-700 dark:text-white rounded-lg p-1 px-2 flex outline-0 w-full ${
          invalid ? 'ring-red-500 ring-2 placeholder:text-red-400' : ''
        }`}
        min={min}
        max={max}
        onKeyDown={
          setInvalid
            ? (event) => {
                if ((event.target as HTMLInputElement).value && invalid) {
                  setInvalid(false);
                }
              }
            : undefined
        }
      />
    </>
  );
};

const clearDate = (date: Date): Date => {
  const copy = new Date(date.toISOString());
  copy.setHours(0);
  copy.setSeconds(0);
  copy.setMinutes(0);
  copy.setMilliseconds(0);
  return copy;
};

const CreateRate: FC = () => {
  const today = clearDate(new Date());
  const [date, setDate] = useState(nextFriday(today));
  const [showCalendar, setShowCalendar] = useState(false);
  const [invalidName, setInvalidName] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [session] = useSession();

  const submitForm: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const payload = {
      title: formData.get('title'),
      count: parseInt(formData.get('count')?.toString() || '3', 10),
      date: date.toUTCString(),
    };

    if (!payload.title) {
      setInvalidName(true);
      return;
    }

    setLoading(true);

    const response = await fetch('/api/rates', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      setLoading(false);
      router.replace('/');
    } else {
      setLoading(false);
      console.warn('oops', await response.json());
    }
  };

  useEffect(() => {
    if (!session?.isAdmin) {
      router.replace('/');
    }
  }, [session, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="lg:w-1/2 flex-col items-center self-center justify-center flex-1 w-full my-3">
      <h1 className="text-xl text-center">Create Rate</h1>
      <form onSubmit={submitForm}>
        <div className="lg:mx-0 mx-3 my-3">
          <Input
            id="rate-title"
            name="title"
            label="Rate Title"
            invalid={invalidName}
            setInvalid={setInvalidName}
          />
        </div>
        <div className="lg:mx-0 mx-3 my-3">
          <Input
            id="number-of-songs"
            name="count"
            label="Number of Songs"
            placeholder="3"
            max={10}
            min={1}
          />
        </div>
        <div className="lg:mx-0 mx-3">
          <div className="mr-3">{format(date, 'EEEE, MMM do yyyy')}</div>
          <Button
            label={showCalendar ? 'Hide Calendar' : 'Show Calendar'}
            type="button"
            buttonType={ButtonType.Primary}
            onClick={() => setShowCalendar(!showCalendar)}
          />
          {showCalendar ? (
            <Calendar
              value={date}
              onChange={(date: Date) => {
                setDate(clearDate(date));
              }}
              maxDate={nextFriday(
                add(today, {
                  months: 1,
                }),
              )}
              calendarType={'Hebrew'}
              minDate={today}
              minDetail="month"
            />
          ) : null}
        </div>
        <div className="flex justify-center">
          <Button
            buttonType={ButtonType.Primary}
            label="Submit"
            type="submit"
            className="w-1/2"
          />
        </div>
      </form>
    </main>
  );
};

export default CreateRate;
