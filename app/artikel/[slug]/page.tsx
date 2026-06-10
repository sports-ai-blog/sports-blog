import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import {
  getAllArticles,
  getArticleBySlug,
  excerpt,
  SITE_URL,
} from '../../../lib/articles';

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

  const description = excerpt(article.content);
  const url = `${SITE_URL}/artikel/${article.slug}`;

  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: article.title,
      description,
      url,
      publishedTime: article.createdAt,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const html = await marked.parse(article.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    datePublished: article.createdAt,
    dateModified: article.createdAt,
    description: excerpt(article.content),
    mainEntityOfPage: `${SITE_URL}/artikel/${article.slug}`,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-400 font-medium">
          ← Zurück zur Übersicht
        </Link>

        <article className="mt-8">
          <h1 className="text-4xl font-bold text-white mb-2">{article.title}</h1>
          <p className="text-gray-400 text-sm mb-8">
            {new Date(article.createdAt).toLocaleDateString('de-DE')}
          </p>
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
    </main>
  );
}
