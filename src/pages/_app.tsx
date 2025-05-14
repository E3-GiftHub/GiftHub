import { type AppType } from "next/app";
import { TRPCReactProvider } from "~/trpc/react";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <TRPCReactProvider>
      <Component {...pageProps} />
    </TRPCReactProvider>
  );
};

export default MyApp;