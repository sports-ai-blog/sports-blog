import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'fs/promises';
import path from 'path';

import { generateMatchRecap } from '../lib/claude.js';
import { saveArticle } from '../lib/storage.js';
import { fetchMatches } from '../lib/matches-shared.js';

const TZ = 'Europe/Berlin';

/** ESPN-Datumsbereich: vorgestern bis heute (UTC) – deckt alle Nachtspiele ab. */
function recentDateRange() {
  const fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
  const today = new Date();
  const start = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
  return `${fmt(start)}-${fmt(today)}`;
}

/** matchIds aller bereits veröffentlichten Spielberichte einsammeln. */
async function getCoveredMatchIds() {
  const covered = new Set();
  try {
    const articlesDir = path.join(process.cwd(), 'articles');
    const files = await fs.readdir(articlesDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const raw = await fs.readFile(path.join(articlesDir, file), 'utf-8');
      const article = JSON.parse(raw);
      if (article.matchId) covered.add(String(article.matchId));
    }
  } catch {
    // Kein articles-Verzeichnis → nichts abgedeckt
  }
  return covered;
}

/** "45'+2'" → 45, "67'" → 67 – für die Halbzeitstand-Berechnung. */
function minuteNumber(minute) {
  const m = String(minute).match(/^(\d+)/);
  return m ? Number(m[1]) : 0;
}

function teamNameFor(match, teamId) {
  if (teamId === match.home.id) return match.home.name;
  if (teamId === match.away.id) return match.away.name;
  return '?';
}

function halftimeScore(match) {
  let home = 0;
  let away = 0;
  for (const goal of match.goals) {
    if (minuteNumber(goal.minute) > 45) continue;
    // Eigentore zählen für das gegnerische Team – teamId ist bei ESPN
    // bereits das Team, dem das Tor gutgeschrieben wird.
    if (goal.teamId === match.home.id) home += 1;
    else if (goal.teamId === match.away.id) away += 1;
  }
  return `${home}:${away}`;
}

function goalLine(match, goal) {
  const extras = [];
  if (goal.penalty) extras.push('Elfmeter');
  if (goal.ownGoal) extras.push('Eigentor');
  if (goal.header) extras.push('Kopfball');
  const suffix = extras.length ? `, ${extras.join(', ')}` : '';
  return `- ${goal.minute} ${goal.scorer} (${teamNameFor(match, goal.teamId)}${suffix})`;
}

function buildFactSheet(match) {
  const kickoff = new Date(match.kickoff).toLocaleString('de-DE', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines = [
    `Spiel: ${match.home.name} gegen ${match.away.name} (${match.phase}, WM 2026)`,
    `Anstoß: ${kickoff} Uhr deutscher Zeit`,
    `Endstand: ${match.home.score}:${match.away.score} (Halbzeit ${halftimeScore(match)})${
      match.statusDetail !== 'Beendet' ? ` – ${match.statusDetail}` : ''
    }`,
  ];

  if (match.venue) {
    lines.push(`Stadion: ${match.venue}${match.city ? `, ${match.city}` : ''}`);
  }
  if (match.attendance) {
    lines.push(`Zuschauer: ${match.attendance.toLocaleString('de-DE')}`);
  }

  if (match.goals.length > 0) {
    lines.push('Tore:');
    for (const goal of match.goals) lines.push(goalLine(match, goal));
  } else {
    lines.push('Tore: keine (torloses Spiel)');
  }

  if (match.redCards.length > 0) {
    lines.push('Rote Karten:');
    for (const card of match.redCards) {
      lines.push(`- ${card.minute} ${card.player} (${teamNameFor(match, card.teamId)})`);
    }
  }

  return lines.join('\n');
}

/** Schlanke match-Daten fürs Artikel-JSON (rendert das Scoreboard). */
function articleMatchData(match) {
  const team = (t) => ({ name: t.name, abbr: t.abbr, logo: t.logo, score: t.score });
  return {
    id: match.id,
    kickoff: match.kickoff,
    phase: match.phase,
    venue: match.venue,
    city: match.city,
    attendance: match.attendance,
    statusDetail: match.statusDetail,
    home: team(match.home),
    away: team(match.away),
    homeTeamId: match.home.id,
    awayTeamId: match.away.id,
    goals: match.goals,
  };
}

async function runRecapAgent() {
  console.log('🤖 Recap-Agent startet...');

  const matches = await fetchMatches(recentDateRange());
  const covered = await getCoveredMatchIds();

  const pending = matches.filter((m) => m.completed && !covered.has(m.id));
  console.log(
    `📊 ${matches.length} Spiele geladen, ${pending.length} ohne Spielbericht`,
  );

  if (pending.length === 0) {
    console.log('✅ Nichts zu tun – alle beendeten Spiele sind abgedeckt.');
    return;
  }

  const failures = [];
  for (const match of pending) {
    const label = `${match.home.name} ${match.home.score}:${match.away.score} ${match.away.name}`;
    try {
      console.log(`📝 Spielbericht: ${label}`);
      const factSheet = buildFactSheet(match);
      const recap = await generateMatchRecap(factSheet);

      if (!recap || !recap.trim()) {
        throw new Error('Generierung lieferte leeren Spielbericht zurück');
      }

      const title = `Spielbericht: ${label}`;
      const saved = await saveArticle(title, recap, {
        matchId: match.id,
        match: articleMatchData(match),
      });
      if (!saved) {
        throw new Error('Spielbericht konnte nicht gespeichert werden');
      }
    } catch (error) {
      console.error(`❌ Fehlgeschlagen für ${label}:`, error.message);
      failures.push(label);
    }
  }

  if (failures.length > 0) {
    throw new Error(`${failures.length} Spielbericht(e) fehlgeschlagen: ${failures.join('; ')}`);
  }
  console.log(`✅ ${pending.length} Spielbericht(e) erstellt!`);
}

runRecapAgent().catch((error) => {
  console.error('❌ Recap-Agent fehlgeschlagen:', error.message);
  process.exit(1);
});
