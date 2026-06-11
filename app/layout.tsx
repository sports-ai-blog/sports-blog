import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getAllArticles, SITE_NAME, SITE_URL } from "../lib/articles";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_DESCRIPTION =
  "Täglich neue Artikel rund um die Fußball-WM: legendäre Spiele, große Stars, Taktik-Analysen, Rekorde und kuriose Geschichten – unterhaltsam erzählt.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sports AI Blog – WM-Geschichten, Rekorde & Analysen",
    template: "%s | Sports AI Blog",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "google-adsense-account": "ca-pub-2165143468514727",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const articles = await getAllArticles();
  const latest = articles.slice(0, 4);
  const categories = [
    ...new Map(articles.map((a) => [a.category.name, a.category])).values(),
  ];

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "de-DE",
    description: SITE_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2165143468514727"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="min-h-full flex flex-col text-slate-300">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />

        <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white"
            >
              <span className="text-2xl">⚽</span> {SITE_NAME}
            </Link>
            <span className="hidden items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 sm:inline-flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400"></span>
              </span>
              Täglich 3 neue Artikel
            </span>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-slate-800 bg-slate-950/60">
          <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:grid-cols-3 sm:px-6">
            <div>
              <p className="flex items-center gap-2 text-base font-extrabold text-white">
                <span className="text-xl">⚽</span> {SITE_NAME}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Die schönsten Geschichten der Fußball-WM – täglich drei neue
                Artikel über Legenden, Rekorde, Taktik und unvergessliche
                Momente.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Neueste Artikel
              </p>
              <ul className="mt-3 space-y-2">
                {latest.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/artikel/${a.slug}`}
                      className="text-sm text-slate-400 transition hover:text-amber-300"
                    >
                      {a.displayTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Themen
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span
                    key={c.name}
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400"
                  >
                    {c.emoji} {c.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800/60">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:px-6">
              <span>
                © {new Date().getFullYear()} {SITE_NAME}
              </span>
              <span>Mit KI erstellt · mit Leidenschaft für Fußball kuratiert</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
