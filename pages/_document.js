import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        {/* Link to the manifest file */}
        <link rel="manifest" href="/manifest.json" />
          {/* You can add other PWA meta tags like icons, theme-color, etc. */}
          <meta name="theme-color" content="#000000" />
          <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
      
        <Main />
        <NextScript />
        {/* <Script>
        if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/firebase-messaging-sw.js')
                .then((registration) => {
                  console.log('Service Worker registered:', registration);
                })
                .catch((err) => {
                  console.error('Service Worker registration failed:', err);
                })
            }
        </Script> */}
      </body>
    </Html>
  );
}
