import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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