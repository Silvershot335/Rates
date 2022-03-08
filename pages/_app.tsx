import '../styles/globals.scss';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Header from '../components/Header';
import Head from 'next/head';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Rates</title>
      </Head>
      <Header>
        <Component {...pageProps} />
      </Header>
    </SessionProvider>
  );
}

export default MyApp;
