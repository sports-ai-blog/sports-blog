/**
 * Gemeinsamer Kern für WM-Spieldaten (ESPN Public API).
 * Wird sowohl von den Next-Seiten (über lib/matches.ts) als auch vom
 * Recap-Agent (scripts/recap-agent.js, plain Node) genutzt – daher JS + JSDoc.
 */

/** Turnierzeitraum der WM 2026 (Eröffnung bis Finale). */
export const WM_DATE_RANGE = '20260611-20260719';

export const SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

/** ESPN liefert englische Ländernamen – Übersetzung für deutsche Leser. */
const TEAM_NAMES_DE = {
  'Albania': 'Albanien', 'Algeria': 'Algerien', 'Argentina': 'Argentinien',
  'Australia': 'Australien', 'Austria': 'Österreich', 'Belgium': 'Belgien',
  'Bolivia': 'Bolivien', 'Bosnia-Herzegovina': 'Bosnien-Herzegowina',
  'Brazil': 'Brasilien', 'Bulgaria': 'Bulgarien', 'Cameroon': 'Kamerun',
  'Canada': 'Kanada', 'Cape Verde': 'Kap Verde', 'Chile': 'Chile',
  'Colombia': 'Kolumbien', 'Costa Rica': 'Costa Rica',
  "Côte d'Ivoire": 'Elfenbeinküste', 'Ivory Coast': 'Elfenbeinküste',
  'Croatia': 'Kroatien', 'Cuba': 'Kuba', 'Curaçao': 'Curaçao',
  'Czechia': 'Tschechien', 'Czech Republic': 'Tschechien',
  'Denmark': 'Dänemark', 'DR Congo': 'DR Kongo', 'Ecuador': 'Ecuador',
  'Egypt': 'Ägypten', 'El Salvador': 'El Salvador', 'England': 'England',
  'Estonia': 'Estland', 'Finland': 'Finnland', 'France': 'Frankreich',
  'Georgia': 'Georgien', 'Germany': 'Deutschland', 'Ghana': 'Ghana',
  'Greece': 'Griechenland', 'Guatemala': 'Guatemala', 'Haiti': 'Haiti',
  'Honduras': 'Honduras', 'Hungary': 'Ungarn', 'Iceland': 'Island',
  'Iran': 'Iran', 'Iraq': 'Irak', 'Ireland': 'Irland',
  'Republic of Ireland': 'Irland', 'Israel': 'Israel', 'Italy': 'Italien',
  'Jamaica': 'Jamaika', 'Japan': 'Japan', 'Jordan': 'Jordanien',
  'Kenya': 'Kenia', 'Kosovo': 'Kosovo', 'Kuwait': 'Kuwait',
  'Lebanon': 'Libanon', 'Libya': 'Libyen', 'Luxembourg': 'Luxemburg',
  'Mali': 'Mali', 'Malta': 'Malta', 'Mexico': 'Mexiko',
  'Moldova': 'Moldau', 'Montenegro': 'Montenegro', 'Morocco': 'Marokko',
  'Mozambique': 'Mosambik', 'Netherlands': 'Niederlande',
  'New Zealand': 'Neuseeland', 'Nigeria': 'Nigeria',
  'North Korea': 'Nordkorea', 'North Macedonia': 'Nordmazedonien',
  'Northern Ireland': 'Nordirland', 'Norway': 'Norwegen', 'Oman': 'Oman',
  'Panama': 'Panama', 'Paraguay': 'Paraguay', 'Peru': 'Peru',
  'Philippines': 'Philippinen', 'Poland': 'Polen', 'Portugal': 'Portugal',
  'Qatar': 'Katar', 'Romania': 'Rumänien', 'Russia': 'Russland',
  'Saudi Arabia': 'Saudi-Arabien', 'Scotland': 'Schottland',
  'Senegal': 'Senegal', 'Serbia': 'Serbien', 'Slovakia': 'Slowakei',
  'Slovenia': 'Slowenien', 'South Africa': 'Südafrika',
  'South Korea': 'Südkorea', 'Spain': 'Spanien', 'Suriname': 'Suriname',
  'Sweden': 'Schweden', 'Switzerland': 'Schweiz', 'Syria': 'Syrien',
  'Trinidad and Tobago': 'Trinidad und Tobago', 'Tunisia': 'Tunesien',
  'Turkey': 'Türkei', 'Türkiye': 'Türkei', 'Ukraine': 'Ukraine',
  'United Arab Emirates': 'Ver. Arabische Emirate',
  'United States': 'USA', 'USA': 'USA', 'Uruguay': 'Uruguay',
  'Uzbekistan': 'Usbekistan', 'Venezuela': 'Venezuela', 'Wales': 'Wales',
  'Zambia': 'Sambia', 'Zimbabwe': 'Simbabwe',
};

const PHASES_DE = {
  'group-stage': 'Gruppenphase',
  'round-of-32': 'Sechzehntelfinale',
  'round-of-16': 'Achtelfinale',
  'quarterfinals': 'Viertelfinale',
  'quarter-finals': 'Viertelfinale',
  'semifinals': 'Halbfinale',
  'semi-finals': 'Halbfinale',
  'third-place-playoff': 'Spiel um Platz 3',
  'final': 'Finale',
};

export function germanTeamName(name) {
  return TEAM_NAMES_DE[name] ?? name;
}

function germanPhase(slug) {
  return PHASES_DE[slug] ?? 'WM 2026';
}

/** "FT"/"HT" usw. in deutsche Status-Labels übersetzen. */
function germanStatusDetail(statusType, displayClock) {
  const name = statusType?.name ?? '';
  if (name === 'STATUS_FULL_TIME' || name === 'STATUS_FINAL') return 'Beendet';
  if (name === 'STATUS_FINAL_AET') return 'Beendet (n.V.)';
  if (name === 'STATUS_FINAL_PEN') return 'Beendet (i.E.)';
  if (name === 'STATUS_HALFTIME') return 'Halbzeit';
  if (name === 'STATUS_POSTPONED') return 'Verschoben';
  if (name === 'STATUS_CANCELED') return 'Abgesagt';
  if (statusType?.state === 'in') return displayClock || 'Live';
  return '';
}

function normalizeCompetitor(competitor, completed) {
  const team = competitor?.team ?? {};
  return {
    id: String(team.id ?? ''),
    name: germanTeamName(team.displayName ?? '?'),
    englishName: team.displayName ?? '?',
    abbr: team.abbreviation ?? '',
    logo: team.logo ?? '',
    score: competitor?.score != null ? Number(competitor.score) : null,
    winner: completed ? Boolean(competitor?.winner) : false,
  };
}

/**
 * Ein ESPN-Scoreboard-Event in unser schlankes Match-Format normalisieren.
 * Gibt null zurück, wenn das Event unbrauchbar ist.
 */
export function normalizeEvent(event) {
  const comp = event?.competitions?.[0];
  if (!comp) return null;

  const statusType = comp.status?.type ?? {};
  const completed = Boolean(statusType.completed);
  const competitors = comp.competitors ?? [];
  const home = competitors.find((c) => c.homeAway === 'home');
  const away = competitors.find((c) => c.homeAway === 'away');
  if (!home || !away) return null;

  const goals = [];
  const redCards = [];
  for (const detail of comp.details ?? []) {
    const minute = detail.clock?.displayValue ?? '';
    const teamId = String(detail.team?.id ?? '');
    const player = detail.athletesInvolved?.[0]?.displayName ?? 'Unbekannt';
    if (detail.scoringPlay && !detail.shootout) {
      goals.push({
        minute,
        scorer: player,
        teamId,
        penalty: Boolean(detail.penaltyKick),
        ownGoal: Boolean(detail.ownGoal),
        header: /header/i.test(detail.type?.text ?? ''),
      });
    } else if (detail.redCard) {
      redCards.push({ minute, player, teamId });
    }
  }

  return {
    id: String(event.id),
    kickoff: comp.date ?? event.date,
    state: statusType.state ?? 'pre', // 'pre' | 'in' | 'post'
    completed,
    statusDetail: germanStatusDetail(statusType, comp.status?.displayClock),
    phase: germanPhase(event.season?.slug ?? ''),
    venue: comp.venue?.fullName ?? '',
    city: comp.venue?.address?.city ?? '',
    attendance: comp.attendance || null,
    home: normalizeCompetitor(home, completed),
    away: normalizeCompetitor(away, completed),
    goals,
    redCards,
  };
}

/**
 * Scoreboard laden und normalisieren, sortiert nach Anstoßzeit.
 * @param {string} dates z. B. '20260611-20260719' oder '20260612'
 * @param {RequestInit} [fetchOptions] z. B. Next-Caching-Optionen
 */
export async function fetchMatches(dates = WM_DATE_RANGE, fetchOptions = {}) {
  const url = `${SCOREBOARD_URL}?dates=${dates}&limit=400`;
  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    throw new Error(`ESPN API antwortete mit ${res.status}`);
  }
  const data = await res.json();
  const matches = (data.events ?? [])
    .map(normalizeEvent)
    .filter(Boolean);
  matches.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
  return matches;
}
