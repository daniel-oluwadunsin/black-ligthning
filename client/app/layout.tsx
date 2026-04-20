import type { Metadata } from "next";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
);

const displayFont = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Black Lightning | Cinematic Music Recognition",
    template: "%s | Black Lightning",
  },
  description:
    "Identify songs in seconds with Black Lightning, an electric high-fidelity recognition experience powered by advanced audio fingerprinting.",
  applicationName: "Black Lightning",
  category: "music",
  keywords: [
    "music recognition",
    "song identifier",
    "audio fingerprinting",
    "Black Lightning",
    "Shazam alternative",
    "cinematic music app",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Black Lightning",
    title: "Black Lightning | Cinematic Music Recognition",
    description:
      "Upload tracks, generate fingerprints, and identify unknown songs with an electric, premium recognition interface.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Black Lightning electric music recognition",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Black Lightning | Cinematic Music Recognition",
    description:
      "Powerful audio recognition with lightning-fast song matching and a premium cinematic interface.",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Black Lightning",
              url: siteUrl.toString(),
              description:
                "Cinematic song recognition platform powered by audio fingerprinting.",
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl.toString()}identify`,
                "query-input": "required name=audio",
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
