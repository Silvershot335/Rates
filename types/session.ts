import { Session as NextSession } from 'next-auth';

export interface Session extends NextSession {
  isAdmin: boolean;
}

interface Token {
  token: {
    accessToken: string;
  };
}

export type SessionWithToken = Session & Token;
