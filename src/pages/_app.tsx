import { type AppType } from "next/app";
import { TRPCReactProvider } from "~/trpc/react";
import "@uploadthing/react/styles.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <TRPCReactProvider>
      <Component {...pageProps} />
    </TRPCReactProvider>
  );
};

export default MyApp;
