import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllArticles, excerpt, formatDate, type Article } from '../lib/articles';
import { getMatches, germanDayKey, formatGermanDay, type Match } from '../lib/matches';
import MatchCard from './components/MatchCard';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/artikel/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-slate-600 hover:bg-slate-900 hover:shadow-xl hover:shadow-black/40"
    >
      <div className={`h-1.5 w-full bg-gradient-to-r ${article.category.gradient}`} />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 font-medium text-slate-300">
            {article.category.emoji} {article.category.name}
          </span>
          <time dateTime={article.createdAt} className="text-slate-500">
            {formatDate(article.createdAt)}
          </time>
        </div>
        <h3 className="text-xl font-bold leading-snug text-white transition-colors group-hover:text-amber-300">
          {article.displayTitle}
        </h3>
        <p className="flex-1 text-sm leading-relaxed text-slate-400">
          {excerpt(article.body, 150)}
        </p>
        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
          <span>⏱️ {article.readingMinutes} Min. Lesezeit</span>
          <span className="font-semibold text-amber-400 transition-transform group-hover:translate-x-1">
            Weiterlesen →
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Spiele für den Homepage-Teaser: heute – sonst der nächste Spieltag. */
function teaserMatches(matches: Match[]): { label: string; matches: Match[] } | null {
  const todayKey = germanDayKey(new Date().toISOString());
  const today = matches.filter((m) => germanDayKey(m.kickoff) === todayKey);
  if (today.length > 0) return { label: 'Spiele heute', matches: today };

  const next = matches.find(
    (m) => m.state === 'pre' && germanDayKey(m.kickoff) > todayKey,
  );
  if (!next) return null;
  const nextKey = germanDayKey(next.kickoff);
  return {
    label: `Nächste Spiele – ${formatGermanDay(next.kickoff)}`,
    matches: matches.filter((m) => germanDayKey(m.kickoff) === nextKey),
  };
}

export default async function Home() {
  const articles = await getAllArticles();
  const [featured, ...rest] = articles;
  const totalMinutes = articles.reduce((sum, a) => sum + a.readingMinutes, 0);

  // Spielplan-Teaser ist nice-to-have – API-Fehler dürfen die Startseite nie brechen
  let teaser: { label: string; matches: Match[] } | null = null;
  try {
    teaser = teaserMatches(await getMatches());
  } catch {
    teaser = null;
  }

  return (
    <main className="px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <section className="mb-14 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Die schönsten Geschichten
            <br className="hidden sm:block" /> der{' '}
            <span className="bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">
              Fußball-WM
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Legendäre Spiele, große Stars, kuriose Momente – täglich neu,
            kompakt erzählt und mit Liebe zum Detail.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm">
            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-1.5 text-slate-300">
              📚 {articles.length} Artikel
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-1.5 text-slate-300">
              🔄 Täglich 3 neue
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-1.5 text-slate-300">
              ⏱️ {totalMinutes} Min. Lesestoff
            </span>
          </div>
        </section>

        {teaser && teaser.matches.length > 0 && (
          <section className="mb-14">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-2xl font-bold text-white">
                ⚽ {teaser.label}
              </h2>
              <Link
                href="/spielplan"
                className="text-sm font-semibold text-amber-400 transition hover:text-amber-300"
              >
                Kompletter Spielplan & Ergebnisse →
              </Link>
            </div>
            <div className="space-y-3">
              {teaser.matches.map((m) => (
                <MatchCard key={m.id} match={m} compact />
              ))}
            </div>
          </section>
        )}

        {featured && (
          <Link
            href={`/artikel/${featured.slug}`}
            className="group block overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/80 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-950/30"
          >
            <div className={`h-2 w-full bg-gradient-to-r ${featured.category.gradient}`} />
            <div className="p-8 sm:p-10">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="rounded-full bg-amber-500/15 px-3 py-1 font-bold uppercase tracking-wider text-amber-300">
                  🔥 Neuester Artikel
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 font-medium text-slate-300">
                  {featured.category.emoji} {featured.category.name}
                </span>
                <time dateTime={featured.createdAt} className="text-slate-500">
                  {formatDate(featured.createdAt)}
                </time>
              </div>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight text-white transition-colors group-hover:text-amber-300 sm:text-4xl">
                {featured.displayTitle}
              </h2>
              <p className="mt-4 max-w-3xl leading-relaxed text-slate-400">
                {excerpt(featured.body, 220)}
              </p>
              <div className="mt-6 flex items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2 font-bold text-slate-950 transition-transform group-hover:scale-105">
                  Jetzt lesen →
                </span>
                <span className="text-slate-500">
                  ⏱️ {featured.readingMinutes} Min. Lesezeit
                </span>
              </div>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <>
            <h2 className="mb-6 mt-16 text-2xl font-bold text-white">
              Alle Artikel
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {rest.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </>
        )}

        {articles.length === 0 && (
          <p className="text-center text-slate-400">
            Noch keine Artikel vorhanden – schau gleich wieder vorbei!
          </p>
        )}
      </div>
    </main>
  );
}
