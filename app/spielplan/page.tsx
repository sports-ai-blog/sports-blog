import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllArticles } from '../../lib/articles';
import {
  getMatches,
  groupByGermanDay,
  germanDayKey,
  type Match,
  type MatchDay,
} from '../../lib/matches';
import MatchCard from '../components/MatchCard';

export const metadata: Metadata = {
  title: 'WM 2026 Spielplan & Ergebnisse',
  description:
    'Alle Spiele der Fußball-WM 2026 auf einen Blick: Live-Ergebnisse, Torschützen, Spielberichte und der komplette Spielplan mit deutschen Anstoßzeiten.',
  alternates: { canonical: '/spielplan' },
};

// Ergebnisse sollen ohne Rebuild aktuell bleiben (~5 Min, s. getMatches)
export const revalidate = 300;

function DaySection({
  day,
  recapSlugs,
}: {
  day: MatchDay;
  recapSlugs: Map<string, string>;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
        {day.label}
      </h3>
      <div className="space-y-3">
        {day.matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            recapSlug={recapSlugs.get(match.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default async function SpielplanPage() {
  let matches: Match[] = [];
  let loadError = false;
  try {
    matches = await getMatches();
  } catch {
    loadError = true;
  }

  // Spielberichte den Spielen zuordnen (matchId → Artikel-Slug)
  const articles = await getAllArticles();
  const recapSlugs = new Map<string, string>();
  for (const a of articles) {
    if (a.matchId) recapSlugs.set(a.matchId, a.slug);
  }

  const todayKey = germanDayKey(new Date().toISOString());

  const live = matches.filter((m) => m.state === 'in');
  const today = matches.filter(
    (m) => germanDayKey(m.kickoff) === todayKey && m.state !== 'in',
  );
  const finishedDays = groupByGermanDay(
    matches.filter((m) => m.state === 'post' && germanDayKey(m.kickoff) < todayKey),
  ).reverse(); // neueste Ergebnisse zuerst
  const upcomingDays = groupByGermanDay(
    matches.filter((m) => m.state === 'pre' && germanDayKey(m.kickoff) > todayKey),
  );

  const finished = matches.filter((m) => m.state === 'post').length;

  return (
    <main className="px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Spielplan &{' '}
            <span className="bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">
              Ergebnisse
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Alle Spiele der WM 2026 – mit Live-Ständen, Torschützen und
            Spielberichten. Anstoßzeiten in deutscher Zeit.
          </p>
          {matches.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-1.5 text-slate-300">
                ⚽ {finished} von {matches.length} Spielen gespielt
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-1.5 text-slate-300">
                🔄 Aktualisiert sich automatisch
              </span>
            </div>
          )}
        </section>

        {loadError && (
          <p className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
            Die Spieldaten konnten gerade nicht geladen werden – schau in ein
            paar Minuten wieder vorbei.
          </p>
        )}

        {live.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-white">
              🔴 Jetzt live
            </h2>
            <div className="space-y-3">
              {live.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        )}

        {today.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-bold text-white">📅 Heute</h2>
            <div className="space-y-3">
              {today.map((m) => (
                <MatchCard key={m.id} match={m} recapSlug={recapSlugs.get(m.id)} />
              ))}
            </div>
          </section>
        )}

        {finishedDays.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-bold text-white">✅ Ergebnisse</h2>
            <div className="space-y-8">
              {finishedDays.map((day) => (
                <DaySection key={day.dayKey} day={day} recapSlugs={recapSlugs} />
              ))}
            </div>
          </section>
        )}

        {upcomingDays.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-bold text-white">
              🗓️ Kommende Spiele
            </h2>
            <div className="space-y-8">
              {upcomingDays.map((day) => (
                <DaySection key={day.dayKey} day={day} recapSlugs={recapSlugs} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-14 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-8 text-center">
          <p className="text-lg font-bold text-white">
            📰 Jeden Morgen: Spielberichte zu allen Partien
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Ergebnis, Highlights und die Spieler des Abends – kompakt in 2–3
            Minuten Lesezeit.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2 text-sm font-bold text-slate-950 transition-transform hover:scale-105"
          >
            Alle Artikel entdecken
          </Link>
        </div>
      </div>
    </main>
  );
}
