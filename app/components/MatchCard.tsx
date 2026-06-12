import Image from 'next/image';
import Link from 'next/link';
import { formatKickoff, type Match } from '../../lib/matches';

function TeamLogo({ team }: { team: Match['home'] }) {
  if (!team.logo) {
    return <span className="h-7 w-7 shrink-0 text-center text-lg">⚽</span>;
  }
  return (
    <Image
      src={team.logo}
      alt={`Flagge ${team.name}`}
      width={28}
      height={28}
      className="h-7 w-7 shrink-0 object-contain"
    />
  );
}

function StatusBadge({ match }: { match: Match }) {
  if (match.state === 'in') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
        </span>
        {match.statusDetail || 'Live'}
      </span>
    );
  }
  if (match.state === 'post') {
    return (
      <span className="text-xs font-semibold text-slate-500">
        {match.statusDetail || 'Beendet'}
      </span>
    );
  }
  return (
    <span className="text-sm font-bold tabular-nums text-slate-300">
      {formatKickoff(match.kickoff)}
    </span>
  );
}

function scorerSummary(match: Match): string {
  if (match.goals.length === 0) return '';
  return match.goals
    .map((g) => {
      const suffix = g.penalty ? ' (E)' : g.ownGoal ? ' (ET)' : '';
      return `${g.scorer} ${g.minute}${suffix}`;
    })
    .join(' · ');
}

/**
 * Eine Spielzeile: Status/Anstoßzeit, Teams, Ergebnis – optional Torschützen
 * und Link zum Spielbericht. `compact` lässt die Detailzeile weg (Homepage).
 */
export default function MatchCard({
  match,
  recapSlug,
  compact = false,
}: {
  match: Match;
  recapSlug?: string;
  compact?: boolean;
}) {
  const started = match.state !== 'pre';
  const scorers = compact ? '' : scorerSummary(match);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 transition-colors hover:border-slate-600">
      <div className="flex items-center gap-2 p-3 sm:gap-4 sm:p-4">
        <div className="w-16 shrink-0 text-center">
          <StatusBadge match={match} />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
          <span
            className={`truncate text-sm font-bold sm:text-base ${
              match.home.winner ? 'text-white' : started ? 'text-slate-300' : 'text-white'
            }`}
          >
            {match.home.name}
          </span>
          <TeamLogo team={match.home} />
        </div>

        <div className="w-14 shrink-0 text-center text-lg font-extrabold tabular-nums text-white sm:w-16 sm:text-xl">
          {started ? (
            <>
              {match.home.score ?? 0}
              <span className="text-slate-500">:</span>
              {match.away.score ?? 0}
            </>
          ) : (
            <span className="text-slate-600">–:–</span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <TeamLogo team={match.away} />
          <span
            className={`truncate text-sm font-bold sm:text-base ${
              match.away.winner ? 'text-white' : started ? 'text-slate-300' : 'text-white'
            }`}
          >
            {match.away.name}
          </span>
        </div>
      </div>

      {(scorers || (!compact && (match.city || recapSlug))) && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-slate-800/70 px-4 py-2 text-xs text-slate-500">
          <span className="min-w-0">
            {scorers && <span>⚽ {scorers}</span>}
            {!scorers && match.city && <span>📍 {match.venue}, {match.city}</span>}
          </span>
          {recapSlug && (
            <Link
              href={`/artikel/${recapSlug}`}
              className="shrink-0 font-semibold text-amber-400 transition hover:text-amber-300"
            >
              📰 Spielbericht lesen →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
