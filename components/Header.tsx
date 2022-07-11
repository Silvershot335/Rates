import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { useSession } from '../hooks/session';
import { Session } from '../types/session';
import Button, { ButtonType } from './Button';

const SessionHeader: FC<{ session: Session; signOut: () => void }> = ({
  session,
  signOut,
  children,
}) => {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-full">
      <div className="px-3 border-b">
        <div className="flex justify-between">
          <Link href={'/'}>
            <a>
              <Button buttonType={ButtonType.Primary} label="Rates" />
            </a>
          </Link>
          <p className='text-sm '>Made by: <abbr className='text-sky-500' title='Deyndra#2234'>Deyndra</abbr> <br></br> Maintained by: <abbr className='text-sky-500' title='SilverShot#6796'>Silvershot</abbr></p>
          {session.isAdmin ? (
            <Link href={'/create-rate'}>
              <a>
                <Button buttonType={ButtonType.Secondary} label="Create Rate" />
              </a>
              
            </Link>
            
          ) : null}
          
        </div>
        <div className="flex justify-between items-center">
          <h2 className="text-xl">Signed in as <p className="text-cyan-500">{session.user?.name}</p></h2>
          <h2 className='text-4xl justify-center '> Welcome to Playlist Club</h2>
          
          <Button
            buttonType={ButtonType.Primary}
            label="Sign Out"
            onClick={() => {
              signOut();
              router.replace('/');
            }}
          />
        </div>
      </div>
    
      {children}
    </div>
  );
};

const LogInPage: FC<{ signIn: () => void }> = ({ signIn }) => {
  return (
    <main
      className="flex flex-col justify-center items-center text-black
      bg-white dark:text-white dark:bg-black h-full w-full"
    >
      <h2 className="text-xl my-3">Not signed in</h2>
      <div>
        <Button
          buttonType={ButtonType.Primary}
          onClick={signIn}
          label="Sign in"
        />
      </div>
    </main>
  );
};
const Header: FC = ({ children }) => {
  const [session, _, signIn, signOut] = useSession();

  if (session) {
    return (
      <SessionHeader session={session} signOut={signOut}>
        {children}
      </SessionHeader>
    );
  }

  return <LogInPage signIn={signIn} />;
};

export default Header;
