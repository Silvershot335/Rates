import '../styles/globals.scss';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Header from '../components/Header';
import Head from 'next/head';
import { Session } from 'next-auth';

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  session: Session;
}>) {
  return (
    <SessionProvider session={pageProps.session}>
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
