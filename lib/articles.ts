import fs from 'fs/promises';
import path from 'path';

export const SITE_URL = 'https://sports-blog-six.vercel.app';

export interface Article {
  title: string;
  content: string;
  createdAt: string;
  id: number;
  slug: string;
}

/** Erzeugt einen SEO-freundlichen Slug aus dem Titel (inkl. Umlaut-Handling). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Kurzer Klartext-Auszug für Meta-Description und Vorschau-Karten. */
export function excerpt(content: string, maxLength = 155): string {
  const plain = content
    .replace(/[#*_`>~-]/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/** Lädt alle Artikel, vergibt eindeutige Slugs und sortiert nach Datum (neueste zuerst). */
export async function getAllArticles(): Promise<Article[]> {
  const dir = path.join(process.cwd(), 'articles');

  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }

  // Deterministische Reihenfolge, damit die Slug-Zuordnung plattformunabhängig stabil ist.
  files = files.filter((f) => f.endsWith('.json')).sort();

  const articles: Article[] = [];
  const seen = new Map<string, number>();

  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), 'utf-8');
    const data = JSON.parse(raw);

    let slug = slugify(data.title || 'artikel');
    const count = seen.get(slug) ?? 0;
    seen.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count + 1}`;

    articles.push({ ...data, slug });
  }

  articles.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return articles;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const articles = await getAllArticles();
  return articles.find((a) => a.slug === slug) ?? null;
}
