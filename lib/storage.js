import fs from 'fs/promises';
import path from 'path';

const ARTICLES_DIR = './articles';

export async function saveArticle(title, content) {
  try {
    await fs.mkdir(ARTICLES_DIR, { recursive: true });
    
    const filename = `${Date.now()}-${title.slice(0, 20).replace(/\s/g, '-')}.json`;
    const filepath = path.join(ARTICLES_DIR, filename);
    
    const article = {
      title,
      content,
      createdAt: new Date().toISOString(),
      id: Date.now()
    };
    
    await fs.writeFile(filepath, JSON.stringify(article, null, 2));
    console.log(`✅ Gespeichert: ${filename}`);
    return article;
  } catch (error) {
    console.error('❌ Fehler beim Speichern:', error);
    throw error;
  }
}