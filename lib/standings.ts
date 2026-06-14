import { germanTeamName } from './matches-shared.js';

export interface StandingRow {
  rank: number;
  teamId: string;
  /** Deutscher Anzeigename (z. B. "Mexiko") */
  name: string;
  abbr: string;
  logo: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  /** Qualifikations-Hinweis aus der API, z. B. "Advance to Round of 32" */
  note: string | null;
  /** Farbe des Qualifikations-Markers (Hex) oder null */
  noteColor: string | null;
}

export interface Group {
  /** API-Name, z. B. "Group A" */
  name: string;
  /** Deutscher Anzeigename, z. B. "Gruppe A" */
  label: string;
  rows: StandingRow[];
}

const STANDINGS_URL =
  'https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings';

function statValue(stats: any[], name: string): string {
  return stats?.find((s) => s.name === name)?.displayValue ?? '';
}

function num(value: string): number {
  const n = Number(String(value).replace('+', ''));
  return Number.isFinite(n) ? n : 0;
}

function normalizeEntry(entry: any): StandingRow {
  const stats = entry?.stats ?? [];
  const team = entry?.team ?? {};
  return {
    rank: num(statValue(stats, 'rank')),
    teamId: String(team.id ?? ''),
    name: germanTeamName(team.displayName ?? '?'),
    abbr: team.abbreviation ?? '',
    logo: team.logos?.[0]?.href ?? team.logo ?? '',
    played: num(statValue(stats, 'gamesPlayed')),
    wins: num(statValue(stats, 'wins')),
    draws: num(statValue(stats, 'ties')),
    losses: num(statValue(stats, 'losses')),
    goalsFor: num(statValue(stats, 'pointsFor')),
    goalsAgainst: num(statValue(stats, 'pointsAgainst')),
    goalDiff: num(statValue(stats, 'pointDifferential')),
    points: num(statValue(stats, 'points')),
    note: entry?.note?.description ?? null,
    noteColor: entry?.note?.color ?? null,
  };
}

/** Deutscher Gruppenname, z. B. "Group A" → "Gruppe A". */
function germanGroupLabel(name: string): string {
  return name.replace(/^Group\s+/i, 'Gruppe ');
}

/**
 * Alle Gruppen-Tabellen der WM 2026, serverseitig mit ~5 Min Cache.
 * Wirft bei API-Fehlern – Aufrufer fangen das ab und degradieren sanft.
 */
export async function getStandings(): Promise<Group[]> {
  const res = await fetch(`${STANDINGS_URL}?season=2026`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`ESPN Standings API antwortete mit ${res.status}`);
  }
  const data = await res.json();
  const groups: Group[] = (data.children ?? [])
    .map((child: any): Group => {
      const rows = (child?.standings?.entries ?? [])
        .map(normalizeEntry)
        .sort((a: StandingRow, b: StandingRow) => a.rank - b.rank);
      return {
        name: child?.name ?? '',
        label: germanGroupLabel(child?.name ?? ''),
        rows,
      };
    })
    .filter((g: Group) => g.rows.length > 0);

  // Nach Gruppenbuchstabe sortieren (A, B, C …)
  groups.sort((a, b) => a.name.localeCompare(b.name));
  return groups;
}
