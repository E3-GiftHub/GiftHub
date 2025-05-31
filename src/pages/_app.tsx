import "~/styles/globals.css";
import { type AppType } from "next/app";
import { TRPCReactProvider } from "~/trpc/react";
import { Geist } from "next/font/google";
import Head from "next/head";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>GiftHub</title>
        <meta
          name="description"
          content="For the love of events, parties, birthdays and more!"
        />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className={geist.variable}>
        <TRPCReactProvider>
          <Component {...pageProps} />
        </TRPCReactProvider>
      </div>
    </>
  );
};

export default MyApp;
