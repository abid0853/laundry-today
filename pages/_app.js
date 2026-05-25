import "@/styles/globals.css";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* PWA Viewport Configuration: Prevents zooming on mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <title>LaunDry Today</title>
      </Head>
      
      {/* Your actual app content */}
      <Component {...pageProps} />
      
      {/* Vercel Analytics Tracker - runs silently in the background */}
      <Analytics />
    </>
  );
}