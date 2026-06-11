import fs from 'fs/promises';
import path from 'path';

export const SITE_URL = 'https://sports-blog-six.vercel.app';
export const SITE_NAME = 'Sports AI Blog';

export interface Category {
  name: string;
  emoji: string;
  /** Tailwind-Gradient-Klassen (Literale, damit Tailwind sie beim Scannen findet) */
  gradient: string;
  /** Hex-Farben für die generierten OG-Bilder */
  colors: [string, string];
}

export interface Article {
  /** Gespeichertes Topic – stabil, Basis für Slug & Dedupe */
  title: string;
  /** Catchy Überschrift aus dem Markdown-H1, Fallback: title */
  displayTitle: string;
  /** Markdown ohne doppeltes H1 (H1 im Body zu H2 degradiert) */
  body: string;
  content: string;
  createdAt: string;
  id: number;
  slug: string;
  readingMinutes: number;
  wordCount: number;
  category: Category;
}

const CATEGORIES: (Category & { keywords: string[] })[] = [
  {
    name: 'Spieler & Legenden',
    emoji: '🌟',
    gradient: 'from-violet-500 to-fuchsia-600',
    colors: ['#8b5cf6', '#c026d3'],
    keywords: [
      'spieler', 'legend', 'talent', 'star', 'kapitän', 'torhüter', 'stürmer',
      'verteidiger', 'spielmacher', 'maestro', 'held', 'debüt', 'karrier',
      'brüder', 'familien', 'älteste', 'trikotnummer', 'geheimtipp', 'joker',
      'trainer', 'zweikämpf', 'kopfball',
    ],
  },
  {
    name: 'Taktik & Analyse',
    emoji: '🧠',
    gradient: 'from-cyan-400 to-blue-600',
    colors: ['#22d3ee', '#2563eb'],
    keywords: [
      'taktik', 'taktisch', 'pressing', 'konter', 'defensiv', 'var',
      'videobeweis', 'abseits', 'psycholog', 'mittelstürmer', 'torwartspiel',
      'vorbereiten', 'doppelpäss',
    ],
  },
  {
    name: 'Tore & Rekorde',
    emoji: '⚽',
    gradient: 'from-amber-400 to-orange-600',
    colors: ['#fbbf24', '#ea580c'],
    keywords: [
      'tor', 'elfmeter', 'freistoß', 'rekord', 'bestmark', 'treffer',
      'schnellsten', 'aufholjagd',
    ],
  },
  {
    name: 'Fankultur & Stadien',
    emoji: '🎉',
    gradient: 'from-pink-500 to-rose-600',
    colors: ['#ec4899', '#e11d48'],
    keywords: [
      'fan', 'kultur', 'maskottchen', 'trikots', 'hymne', 'stadion',
      'spielort', 'jubel', 'wm-ball', 'wetter', 'regen',
    ],
  },
  {
    name: 'Geschichte & Momente',
    emoji: '📜',
    gradient: 'from-emerald-400 to-teal-600',
    colors: ['#34d399', '#0d9488'],
    keywords: [
      'geschichte', 'final', 'skandal', 'moment', 'comeback', 'drama',
      'generation', 'pokal', 'eröffnung', 'abschied', 'rivalit', 'krimi',
      'verletzung', 'fehlentscheid', 'rote karten', 'überraschung',
      'underdog', 'außenseiter', 'gastgeber', 'politisch', 'vereint',
      'warten', 'kurios', 'emotional', 'schiedsrichter',
    ],
  },
];

const DEFAULT_CATEGORY: Category = {
  name: 'WM Spezial',
  emoji: '🏆',
  gradient: 'from-sky-400 to-indigo-600',
  colors: ['#38bdf8', '#4f46e5'],
};

export function categorize(title: string): Category {
  const t = title.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((k) => t.includes(k))) {
      const { keywords: _ignored, ...category } = cat;
      return category;
    }
  }
  return DEFAULT_CATEGORY;
}

/** Erzeugt einen SEO-freundlichen Slug (inkl. Umlaut-Handling). */
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

/** Catchy Überschrift aus dem ersten Markdown-H1, Fallback: gespeichertes Topic. */
function deriveDisplayTitle(title: string, content: string): string {
  const m = content.trim().match(/^#\s+(.+)/);
  if (!m) return title;
  const derived = m[1].replace(/[*_`#]/g, '').trim();
  return derived.length >= 5 ? derived : title;
}

/** Entfernt das doppelte H1 und degradiert weitere H1 zu H2 (eine H1 pro Seite). */
function prepareBody(content: string): string {
  let body = content.trim();
  body = body.replace(/^#\s+.+\n+/, '');
  body = body.replace(/^#\s+/gm, '## ');
  return body;
}

/** Klartext-Auszug ohne Überschriften – für Meta-Description und Karten. */
export function excerpt(content: string, maxLength = 155): string {
  const plain = content
    .replace(/^#{1,6}\s+.*$/gm, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*[-+*]\s+/gm, ' ')
    .replace(/[#*_`>~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Lädt alle Artikel, vergibt stabile Slugs, sortiert nach Datum (neueste zuerst). */
export async function getAllArticles(): Promise<Article[]> {
  const dir = path.join(process.cwd(), 'articles');

  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }

  // Deterministische Reihenfolge, damit die Slug-Zuordnung stabil bleibt.
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

    const body = prepareBody(data.content || '');
    const wordCount = body.split(/\s+/).filter(Boolean).length;

    articles.push({
      ...data,
      slug,
      body,
      displayTitle: deriveDisplayTitle(data.title, data.content || ''),
      wordCount,
      readingMinutes: Math.max(1, Math.round(wordCount / 200)),
      category: categorize(data.title),
    });
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

const STOPWORDS = new Set([
  'eine', 'einer', 'eines', 'ihre', 'ihrer', 'sich', 'beim', 'nach', 'über',
  'aller', 'alle', 'allen', 'zeiten', 'jahre', 'wandel', 'rund',
  'weltmeisterschaft', 'weltmeisterschaften', 'weltfußball', 'fußball',
  'geschichte', 'besten', 'größten', 'schönsten', 'legendäre', 'legendären',
  'wenn', 'ganze', 'ihren', 'ihrem', 'durch', 'ohne', 'gegen',
]);

function significantWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-zäöüß0-9\s-]/g, ' ')
      .split(/[\s-]+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w)),
  );
}

/** Thematisch ähnliche Artikel – hält Leser auf der Seite. */
export function relatedArticles(
  current: Article,
  all: Article[],
  count = 3,
): Article[] {
  const currentWords = significantWords(
    `${current.title} ${current.displayTitle}`,
  );

  const scored = all
    .filter((a) => a.slug !== current.slug)
    .map((a) => {
      const words = significantWords(`${a.title} ${a.displayTitle}`);
      let score = 0;
      for (const w of words) if (currentWords.has(w)) score += 2;
      if (a.category.name === current.category.name) score += 1;
      return { article: a, score };
    });

  scored.sort(
    (x, y) =>
      y.score - x.score ||
      new Date(y.article.createdAt).getTime() -
        new Date(x.article.createdAt).getTime(),
  );

  return scored.slice(0, count).map((s) => s.article);
}
