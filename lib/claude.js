import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Spielbericht aus einem Faktenblock generieren. Das Modell darf nur die
 * gelieferten Fakten verwenden – sonst halluziniert es Spielszenen.
 */
export async function generateMatchRecap(factSheet) {
  const message = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Du bist Sportjournalist für einen deutschen Fußball-Blog zur WM 2026.
Schreibe einen Spielbericht auf Basis AUSSCHLIESSLICH dieser Fakten:

${factSheet}

Strenge Regeln:
- Nutze NUR die oben genannten Fakten. Erfinde keine konkreten Spielszenen, Chancen, Statistiken, Zitate oder Verletzungen, die dort nicht stehen.
- Allgemeine, atmosphärische Formulierungen sind erlaubt (z. B. "ein hart umkämpfter Abend"), konkrete erfundene Details nicht.
- Tore, Torschützen, Minuten und Karten müssen exakt mit den Fakten übereinstimmen.

Format: Markdown
Länge: 400–550 Wörter (2–3 Minuten Lesezeit)
Aufbau:
1. Eine catchy H1-Überschrift, die beide Teams und das Ergebnis enthält
2. Ein packender Einstiegsabsatz mit dem Wichtigsten
3. Abschnitt "## So lief das Spiel" – der Spielverlauf entlang der Tore und Karten
4. Abschnitt "## Spieler des Spiels" – würdige den auffälligsten Spieler (z. B. Torschützen) anhand der Fakten
5. Abschnitt "## Das bedeutet das Ergebnis" – kurze Einordnung für den weiteren Turnierverlauf (allgemein, ohne erfundene Tabellenstände)

Tone: Lebendig, unterhaltsam, journalistisch – wie ein guter Live-Ticker-Nachbericht.`,
      },
    ],
  });

  return message.choices[0].message.content;
}

export async function generateArticle(topic) {
  const message = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Schreibe einen Blog-Artikel über: ${topic}
        
Format: Markdown
Länge: 800 Wörter
Tone: Unterhaltsam & informativ`,
      },
    ],
  });

  return message.choices[0].message.content;
}