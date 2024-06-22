import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { SessionWithToken } from '../../../types/session';

export default NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    // SpotifyProvider({
    //   authorization:
    //     'https://accounts.spotify.com/authorize?scope=user-read-email,playlist-modify-public,playlist-modify-private',
    //   clientId: process.env.SPOTIFY_CLIENT_ID!,
    //   clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    // }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, user, token }) {
      (session as SessionWithToken).user = user ?? (session as SessionWithToken).user;

      (session as SessionWithToken).isAdmin = process.env.RATE_CREATOR_EMAIL?.includes((session as SessionWithToken).user!.email!)?true:false;
      console.log('nextauth', session)
      return session;
    },
  },
});
