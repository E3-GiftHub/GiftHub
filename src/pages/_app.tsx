import { type AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { type Session } from "next-auth";
import { TRPCReactProvider } from "~/trpc/react";

const MyApp = ({
  Component,
  pageProps,
}: AppProps<{ session: Session | null }>) => {
  return (
    <SessionProvider session={pageProps.session}>
      <TRPCReactProvider>
        <Component {...pageProps} />
      </TRPCReactProvider>
    </SessionProvider>
  );
};

export default MyApp;
