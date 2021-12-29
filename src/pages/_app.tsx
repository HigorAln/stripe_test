import { SessionProvider as NextProvider } from "next-auth/react";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <NextProvider session={session}>
        <Component {...pageProps} />
      </NextProvider>
    </>
  );
}

export default MyApp;
