import * as nextAuth from 'next-auth/react';
import { Session } from '../types/session';

export const useSession = (): [
  Session | null,
  ReturnType<typeof nextAuth.useSession>['status'],
  typeof nextAuth.signIn,
  typeof nextAuth.signOut
] => {
  const { data: session, status } = nextAuth.useSession();

  return [session as Session, status, nextAuth.signIn, nextAuth.signOut];
};
