import { fetchMatches, WM_DATE_RANGE } from './matches-shared.js';

export interface MatchTeam {
  id: string;
  /** Deutscher Anzeigename (z. B. "Mexiko") */
  name: string;
  englishName: string;
  abbr: string;
  logo: string;
  score: number | null;
  winner: boolean;
}

export interface MatchGoal {
  minute: string;
  scorer: string;
  teamId: string;
  penalty: boolean;
  ownGoal: boolean;
  header: boolean;
}

export interface MatchRedCard {
  minute: string;
  player: string;
  teamId: string;
}

export interface Match {
  id: string;
  kickoff: string;
  state: 'pre' | 'in' | 'post';
  completed: boolean;
  statusDetail: string;
  phase: string;
  venue: string;
  city: string;
  attendance: number | null;
  home: MatchTeam;
  away: MatchTeam;
  goals: MatchGoal[];
  redCards: MatchRedCard[];
}

const TZ = 'Europe/Berlin';

/**
 * Alle WM-Spiele (Spielplan + Ergebnisse), serverseitig mit ~5 Min Cache.
 * Wirft bei API-Fehlern – Aufrufer fangen das ab und degradieren sanft.
 */
export async function getMatches(): Promise<Match[]> {
  return fetchMatches(WM_DATE_RANGE, {
    next: { revalidate: 300 },
  }) as Promise<Match[]>;
}

/** Kalendertag (YYYY-MM-DD) eines Zeitpunkts in deutscher Zeit. */
export function germanDayKey(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ });
}

/** "Freitag, 12. Juni 2026" */
export function formatGermanDay(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Anstoßzeit in deutscher Zeit, z. B. "21:00" */
export function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export interface MatchDay {
  dayKey: string;
  label: string;
  matches: Match[];
}

/** Spiele nach deutschem Kalendertag gruppieren (Reihenfolge bleibt erhalten). */
export function groupByGermanDay(matches: Match[]): MatchDay[] {
  const days: MatchDay[] = [];
  let current: MatchDay | null = null;

  for (const match of matches) {
    const dayKey = germanDayKey(match.kickoff);
    if (!current || current.dayKey !== dayKey) {
      current = { dayKey, label: formatGermanDay(match.kickoff), matches: [] };
      days.push(current);
    }
    current.matches.push(match);
  }
  return days;
}
