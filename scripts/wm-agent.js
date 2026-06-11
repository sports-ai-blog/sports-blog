import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'fs/promises';
import path from 'path';

import { generateArticle } from "../lib/claude.js";
import { saveArticle } from "../lib/storage.js";

const topics = [
  "Top Spieler der WM",
  "Beste Tore der WM",
  "Überraschungen der WM",
  "Die größten WM-Skandale der Geschichte",
  "Die besten Torhüter der WM-Geschichte",
  "Legendäre WM-Finals und ihre Geschichten",
  "Die jüngsten WM-Talente aller Zeiten",
  "Taktische Revolutionen bei Weltmeisterschaften",
  "Die emotionalsten Momente der WM",
  "WM-Gastgeber: Erfolge und Enttäuschungen",
  "Die besten Trainer der WM-Geschichte",
  "Underdog-Teams, die für Furore sorgten",
  "Die schönsten WM-Trikots aller Zeiten",
  "Elfmeterschießen: Drama pur bei der WM",
  "Die torreichsten WM-Spiele der Geschichte",
  "Rekorde und Bestmarken bei Weltmeisterschaften",
  "Die größten Fehlentscheidungen der WM",
  "Stürmer-Legenden und ihre WM-Tore",
  "Die Rolle des VAR bei der WM",
  "Afrikanische Teams bei der Weltmeisterschaft",
  "Asiens Aufstieg im Weltfußball",
  "Südamerika gegen Europa: Die WM-Rivalität",
  "Die kuriosesten Momente der WM-Geschichte",
  "WM-Maskottchen im Wandel der Zeit",
  "Verletzungen, die WM-Träume zerstörten",
  "Die besten Comeback-Spiele der WM",
  "Mittelfeld-Maestros der Weltmeisterschaft",
  "Die WM und ihre politische Bedeutung",
  "Fan-Kultur rund um die Weltmeisterschaft",
  "Wie sich der WM-Ball über die Jahre verändert hat",
  "Die legendärsten WM-Kapitäne aller Zeiten",
  "Brasiliens fünf WM-Titel: Eine Erfolgsgeschichte",
  "Deutschlands Weg zu vier Weltmeistertiteln",
  "Italiens defensive Fußballkunst bei der WM",
  "Argentiniens emotionale WM-Geschichte",
  "Die schnellsten Tore der WM-Geschichte",
  "Wundertore: Die spektakulärsten WM-Treffer",
  "Die längsten Spiele und Verlängerungen der WM",
  "WM-Debütanten, die alle überraschten",
  "Die besten Linksverteidiger der WM-Geschichte",
  "Spielmacher, die Weltmeisterschaften prägten",
  "Die kältesten und heißesten WM-Spielorte",
  "Wie Wetter und Höhe WM-Spiele beeinflussten",
  "Die teuersten Spieler bei Weltmeisterschaften",
  "WM-Helden, die nur ein Turnier glänzten",
  "Brüder und Familien bei der Weltmeisterschaft",
  "Die ältesten WM-Spieler aller Zeiten",
  "Rote Karten, die WM-Spiele entschieden",
  "Die dramatischsten Halbfinals der WM",
  "Gruppenphasen-Krimis: Wenn alles auf dem Spiel steht",
  "Die besten Konterspiele der WM-Geschichte",
  "WM-Stadien: Architektonische Meisterwerke",
  "Die Eröffnungsspiele großer Weltmeisterschaften",
  "Vom Geheimtipp zum Weltstar dank der WM",
  "Die emotionalsten Nationalhymnen-Momente",
  "Trainer-Duelle, die WM-Geschichte schrieben",
  "Die besten Defensivreihen der WM-Geschichte",
  "WM-Tore, die zu Ikonen wurden",
  "Verschossene Elfmeter und ihre Folgen",
  "Die größten Aufholjagden der WM",
  "Nationen, die ewig auf den WM-Titel warten",
  "Die kürzesten WM-Karrieren großer Spieler",
  "Doppelpässe und Traumkombinationen bei der WM",
  "Die besten Kopfballspezialisten der WM",
  "WM-Rekordtorschützen im Vergleich",
  "Wie Videobeweis den Fußball verändert hat",
  "Die schönsten Freistoßtore der Weltmeisterschaft",
  "Außenseiter im WM-Finale: David gegen Goliath",
  "Die Geschichte des WM-Pokals",
  "Schiedsrichter, die WM-Geschichte schrieben",
  "Die meistdiskutierten Abseitsentscheidungen",
  "WM-Generationen: Goldene Teams im Vergleich",
  "Die besten Joker-Tore von der Bank",
  "Verletzungsdramen kurz vor dem großen Turnier",
  "Die taktische Bedeutung des Mittelstürmers",
  "Wie sich Torwartspiel über Jahrzehnte wandelte",
  "Legendäre Trikotnummern und ihre Träger",
  "Die emotionalsten Abschiede von WM-Legenden",
  "Nordamerikas wachsende Rolle im Weltfußball",
  "Ozeaniens lange Reise zur Weltmeisterschaft",
  "Die besten WM-Spiele bei Regen und Schlamm",
  "Wie Nationalmannschaften sich auf die WM vorbereiten",
  "Die psychologische Seite des Elfmeterschießens",
  "WM-Momente, die ganze Nationen vereinten",
  "Die schnellsten Spieler der WM-Geschichte",
  "Comeback-Geschichten nach schweren Verletzungen",
  "Die taktischen Trends moderner Weltmeisterschaften",
  "Wie Pressing den modernen Fußball dominiert",
  "Die besten Zweikämpfer der WM-Geschichte",
  "Legendäre Rivalitäten zwischen Nationen",
  "Die unvergesslichsten WM-Jubel der Geschichte",
];

async function getUsedTopics() {
  try {
    const articlesDir = path.join(process.cwd(), 'articles');
    const files = await fs.readdir(articlesDir);
    const used = new Set();

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(articlesDir, file), 'utf-8');
        const article = JSON.parse(content);
        if (article.title) used.add(article.title);
      }
    }
    return used;
  } catch {
    return new Set();
  }
}

async function runAgent() {
  console.log("🤖 Agent startet...");

  const used = await getUsedTopics();
  const available = topics.filter((t) => !used.has(t));

  // Alle Themen schon geschrieben? Dann zufällig eins wiederverwenden.
  const pool = available.length > 0 ? available : topics;
  const topic = pool[Math.floor(Math.random() * pool.length)];

  console.log(`📝 Topic: ${topic} (${available.length} noch offen)`);

  const article = await generateArticle(topic);

  if (!article || !article.trim()) {
    throw new Error("Generierung lieferte leeren Artikel zurück");
  }
  console.log("✅ Artikel generiert!");

  const saved = await saveArticle(topic, article);
  if (!saved) {
    throw new Error("Artikel konnte nicht gespeichert werden");
  }
}

runAgent().catch((error) => {
  console.error("❌ Agent fehlgeschlagen:", error.message);
  process.exit(1);
});
