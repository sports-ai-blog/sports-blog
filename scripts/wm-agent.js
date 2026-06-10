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

  try {
    const article = await generateArticle(topic);
    console.log("✅ Artikel generiert!");

    await saveArticle(topic, article);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

runAgent();
