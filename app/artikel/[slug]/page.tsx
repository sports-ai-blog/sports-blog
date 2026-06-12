import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllArticles,
  getArticleBySlug,
  relatedArticles,
  excerpt,
  formatDate,
  SITE_NAME,
  SITE_URL,
  type Article,
} from '../../../lib/articles';
import { renderArticle } from '../../../lib/markdown';
import ReadingProgress from '../../components/ReadingProgress';
import MatchScoreboard from '../../components/MatchScoreboard';

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return { title: 'Artikel nicht gefunden' };

  const description = excerpt(article.body);
  const url = `${SITE_URL}/artikel/${article.slug}`;

  return {
    title: article.displayTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: article.displayTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'de_DE',
      publishedTime: article.createdAt,
      section: article.category.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.displayTitle,
      description,
    },
  };
}

function MiniCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/artikel/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-slate-600"
    >
      <div className={`h-1 w-full bg-gradient-to-r ${article.category.gradient}`} />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs text-slate-500">
          {article.category.emoji} {article.category.name}
        </span>
        <span className="text-sm font-bold leading-snug text-white transition-colors group-hover:text-amber-300">
          {article.displayTitle}
        </span>
        <span className="mt-auto pt-1 text-xs text-slate-500">
          ⏱️ {article.readingMinutes} Min.
        </span>
      </div>
    </Link>
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const all = await getAllArticles();
  const article = all.find((a) => a.slug === slug);

  if (!article) notFound();

  const { html, headings } = renderArticle(article.body);
  const related = relatedArticles(article, all, 3);

  const index = all.findIndex((a) => a.slug === slug);
  const newer = index > 0 ? all[index - 1] : null;
  const older = index < all.length - 1 ? all[index + 1] : null;

  const url = `${SITE_URL}/artikel/${article.slug}`;
  const shareTitle = encodeURIComponent(article.displayTitle);
  const shareUrl = encodeURIComponent(url);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.displayTitle,
    description: excerpt(article.body),
    datePublished: article.createdAt,
    dateModified: article.createdAt,
    inLanguage: 'de-DE',
    wordCount: article.wordCount,
    articleSection: article.category.name,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };

  // Spielberichte zusätzlich als SportsEvent auszeichnen (Rich Results)
  const sportsEventJsonLd = article.match
    ? {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name: `${article.match.home.name} gegen ${article.match.away.name}`,
        startDate: article.match.kickoff,
        eventStatus: 'https://schema.org/EventScheduled',
        location: article.match.venue
          ? {
              '@type': 'Place',
              name: article.match.venue,
              address: article.match.city,
            }
          : undefined,
        competitor: [
          { '@type': 'SportsTeam', name: article.match.home.name },
          { '@type': 'SportsTeam', name: article.match.away.name },
        ],
      }
    : null;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: article.displayTitle, item: url },
    ],
  };

  return (
    <main className="px-4 py-10 sm:px-6">
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {sportsEventJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventJsonLd) }}
        />
      )}

      <div className="mx-auto max-w-3xl">
        <nav aria-label="Brotkrumen" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="transition hover:text-amber-300">
            Start
          </Link>
          <span aria-hidden>›</span>
          <span className="text-slate-400">
            {article.category.emoji} {article.category.name}
          </span>
        </nav>

        <header>
          <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            {article.displayTitle}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <time dateTime={article.createdAt}>
              📅 {formatDate(article.createdAt)}
            </time>
            <span>⏱️ {article.readingMinutes} Min. Lesezeit</span>
            <span>
              {article.category.emoji} {article.category.name}
            </span>
          </div>
        </header>

        {article.match && <MatchScoreboard match={article.match} />}

        {headings.length >= 3 && (
          <details className="toc" open>
            <summary>📑 Inhalt dieses Artikels</summary>
            <ol>
              {headings.map((h) => (
                <li key={h.id} className={h.level === 2 ? 'toc-h2' : 'toc-h3'}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
            </ol>
          </details>
        )}

        <div
          className="article-content mt-8"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-8">
          <span className="text-sm font-semibold text-slate-400">
            Artikel teilen:
          </span>
          <a
            href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
          >
            WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-sm text-slate-300 transition hover:border-sky-500 hover:text-sky-300"
          >
            X / Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-sm text-slate-300 transition hover:border-blue-500 hover:text-blue-300"
          >
            Facebook
          </a>
        </div>

        {(older || newer) && (
          <nav aria-label="Weitere Artikel" className="mt-8 grid gap-4 sm:grid-cols-2">
            {older ? (
              <Link
                href={`/artikel/${older.slug}`}
                className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-600"
              >
                <span className="text-xs text-slate-500">← Älterer Artikel</span>
                <span className="mt-1 block text-sm font-bold text-white transition-colors group-hover:text-amber-300">
                  {older.displayTitle}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link
                href={`/artikel/${newer.slug}`}
                className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-right transition hover:border-slate-600"
              >
                <span className="text-xs text-slate-500">Neuerer Artikel →</span>
                <span className="mt-1 block text-sm font-bold text-white transition-colors group-hover:text-amber-300">
                  {newer.displayTitle}
                </span>
              </Link>
            )}
          </nav>
        )}

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-2xl font-bold text-white">
              Das könnte dich auch interessieren
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((a) => (
                <MiniCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-14 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-8 text-center">
          <p className="text-lg font-bold text-white">
            ⚽ Täglich 3 neue WM-Geschichten
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Legenden, Rekorde, Dramen – jeden Tag frischer Lesestoff.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2 text-sm font-bold text-slate-950 transition-transform hover:scale-105"
          >
            Alle Artikel entdecken
          </Link>
        </div>
      </div>
    </main>
  );
}
