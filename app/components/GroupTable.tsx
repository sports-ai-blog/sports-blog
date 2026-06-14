import Image from 'next/image';
import type { Group, StandingRow } from '../../lib/standings';

function TeamLogo({ row }: { row: StandingRow }) {
  if (!row.logo) {
    return <span className="h-5 w-5 shrink-0 text-center text-sm">⚽</span>;
  }
  return (
    <Image
      src={row.logo}
      alt={`Flagge ${row.name}`}
      width={20}
      height={20}
      className="h-5 w-5 shrink-0 object-contain"
    />
  );
}

/**
 * Eine Gruppen-Tabelle: Platz, Team, Spiele, Tordifferenz und Punkte.
 * Der farbige linke Rand markiert die Qualifikation (Daten aus der API).
 */
export default function GroupTable({ group }: { group: Group }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
      <h3 className="border-b border-slate-800 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-amber-300">
        {group.label}
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-500">
            <th className="py-2 pl-3 pr-1 text-left font-semibold" />
            <th className="py-2 px-1 text-left font-semibold">Team</th>
            <th className="py-2 px-1 text-center font-semibold">Sp</th>
            <th className="hidden py-2 px-1 text-center font-semibold sm:table-cell">
              S
            </th>
            <th className="hidden py-2 px-1 text-center font-semibold sm:table-cell">
              U
            </th>
            <th className="hidden py-2 px-1 text-center font-semibold sm:table-cell">
              N
            </th>
            <th className="hidden py-2 px-1 text-center font-semibold sm:table-cell">
              Tore
            </th>
            <th className="py-2 px-1 text-center font-semibold">Diff</th>
            <th className="py-2 pl-1 pr-3 text-center font-semibold">Pkt</th>
          </tr>
        </thead>
        <tbody>
          {group.rows.map((row) => (
            <tr
              key={row.teamId}
              className="border-t border-slate-800/70 text-slate-300"
            >
              <td className="py-2.5 pl-3 pr-1">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded text-xs font-bold tabular-nums text-slate-950"
                  style={{ backgroundColor: row.noteColor ?? '#475569' }}
                  title={row.note ?? undefined}
                >
                  {row.rank}
                </span>
              </td>
              <td className="py-2.5 px-1">
                <div className="flex items-center gap-2">
                  <TeamLogo row={row} />
                  <span className="truncate font-semibold text-white">
                    {row.name}
                  </span>
                </div>
              </td>
              <td className="py-2.5 px-1 text-center tabular-nums">
                {row.played}
              </td>
              <td className="hidden py-2.5 px-1 text-center tabular-nums sm:table-cell">
                {row.wins}
              </td>
              <td className="hidden py-2.5 px-1 text-center tabular-nums sm:table-cell">
                {row.draws}
              </td>
              <td className="hidden py-2.5 px-1 text-center tabular-nums sm:table-cell">
                {row.losses}
              </td>
              <td className="hidden py-2.5 px-1 text-center tabular-nums text-slate-400 sm:table-cell">
                {row.goalsFor}:{row.goalsAgainst}
              </td>
              <td className="py-2.5 px-1 text-center tabular-nums text-slate-400">
                {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
              </td>
              <td className="py-2.5 pl-1 pr-3 text-center font-bold tabular-nums text-white">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
