import { marked } from 'marked';
import { slugify } from './articles';

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Rendert den Artikel-Body zu HTML und versieht h2/h3 mit Anker-IDs.
 * Die IDs entstehen im selben Durchlauf wie die Heading-Liste,
 * damit Inhaltsverzeichnis und Sprungziele garantiert übereinstimmen.
 */
export function renderArticle(markdownBody: string): {
  html: string;
  headings: Heading[];
} {
  let html = marked.parse(markdownBody, { async: false }) as string;

  const headings: Heading[] = [];
  const seen = new Map<string, number>();

  html = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g,
    (_match, level: string, _attrs: string, inner: string) => {
      const text = decodeEntities(inner.replace(/<[^>]+>/g, '')).trim();

      let id = slugify(text) || 'abschnitt';
      const n = (seen.get(id) ?? 0) + 1;
      seen.set(id, n);
      if (n > 1) id = `${id}-${n}`;

      headings.push({ id, text, level: level === '2' ? 2 : 3 });
      return `<h${level} id="${id}">${inner}</h${level}>`;
    },
  );

  return { html, headings };
}
