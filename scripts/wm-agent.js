import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generateArticle } from "../lib/claude.js";
import { saveArticle } from "../lib/storage.js";

const topics = [
  "Top Spieler der WM",
  "Beste Tore der WM",
  "Überraschungen der WM",
];

async function runAgent() {
  console.log("🤖 Agent startet...");

  const topic = topics[Math.floor(Math.random() * topics.length)];
  console.log(`📝 Topic: ${topic}`);

  try {
    const article = await generateArticle(topic);
    console.log("✅ Artikel generiert!");
    
    await saveArticle(topic, article);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

runAgent();