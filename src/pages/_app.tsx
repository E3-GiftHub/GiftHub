import "~/styles/globals.css";
import { type AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { type Session } from "next-auth";
import { TRPCReactProvider } from "~/trpc/react";
import { Geist } from "next/font/google";
import Head from "next/head";
import "@uploadthing/react/styles.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const MyApp = ({
  Component,
  pageProps,
}: AppProps<{ session: Session | null }>) => {
  return (
    <>
      <Head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <title>GiftHub</title>
        <meta
          name="description"
          content="For the love of events, parties, birthdays and more!"
        />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className={geist.variable}>
        <SessionProvider session={pageProps.session}>
          <TRPCReactProvider>
            <Component {...pageProps} />
          </TRPCReactProvider>
        </SessionProvider>
      </div>
    </>
  );
};

export default MyApp;
