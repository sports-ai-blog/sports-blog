import Image from 'next/image';
import type { ArticleMatch } from '../../lib/articles';

function goalLabel(goal: ArticleMatch['goals'][number]): string {
  const suffix = goal.penalty ? ' (Elfmeter)' : goal.ownGoal ? ' (Eigentor)' : '';
  return `${goal.minute} ${goal.scorer}${suffix}`;
}

function TeamColumn({
  team,
  align,
}: {
  team: ArticleMatch['home'];
  align: 'left' | 'right';
}) {
  return (
    <div
      className={`flex flex-1 flex-col items-center gap-2 ${
        align === 'left' ? 'sm:items-start' : 'sm:items-end'
      }`}
    >
      {team.logo && (
        <Image
          src={team.logo}
          alt={`Flagge ${team.name}`}
          width={56}
          height={56}
          className="h-14 w-14 object-contain"
        />
      )}
      <span className="text-center text-lg font-extrabold text-white sm:text-xl">
        {team.name}
      </span>
    </div>
  );
}

/** Ergebnis-Box über Spielberichten: Teams, Endstand, Torschützen, Stadion. */
export default function MatchScoreboard({ match }: { match: ArticleMatch }) {
  const kickoffDate = new Date(match.kickoff).toLocaleDateString('de-DE', {
    timeZone: 'Europe/Berlin',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const homeGoals = match.goals.filter((g) => g.teamId === match.homeTeamId);
  const awayGoals = match.goals.filter((g) => g.teamId === match.awayTeamId);

  return (
    <section
      aria-label="Spielergebnis"
      className="mt-8 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/80"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-lime-400 to-green-600" />
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 font-medium text-slate-300">
            🏆 {match.phase}
          </span>
          <span>{kickoffDate}</span>
          {match.venue && (
            <span>
              📍 {match.venue}
              {match.city ? `, ${match.city}` : ''}
            </span>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <TeamColumn team={match.home} align="left" />
          <div className="flex flex-col items-center">
            <span className="text-4xl font-extrabold tabular-nums text-white sm:text-5xl">
              {match.home.score ?? '–'}
              <span className="mx-1 text-slate-500">:</span>
              {match.away.score ?? '–'}
            </span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-lime-400">
              {match.statusDetail}
            </span>
          </div>
          <TeamColumn team={match.away} align="right" />
        </div>

        {match.goals.length > 0 && (
          <div className="mt-6 grid gap-2 border-t border-slate-800 pt-4 text-sm text-slate-400 sm:grid-cols-2">
            <ul className="space-y-1 sm:text-left">
              {homeGoals.map((g, i) => (
                <li key={`h-${i}`}>⚽ {goalLabel(g)}</li>
              ))}
            </ul>
            <ul className="space-y-1 sm:text-right">
              {awayGoals.map((g, i) => (
                <li key={`a-${i}`}>⚽ {goalLabel(g)}</li>
              ))}
            </ul>
          </div>
        )}

        {match.attendance != null && (
          <p className="mt-4 text-center text-xs text-slate-500">
            👥 {match.attendance.toLocaleString('de-DE')} Zuschauer
          </p>
        )}
      </div>
    </section>
  );
}
