import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* PWA Viewport Configuration: Prevents zooming on mobile to feel like a native app */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <title>LaunDry Today</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}