import Link from 'next/link';
import { getAllArticles, excerpt } from '../lib/articles';

export default async function Home() {
  const articles = await getAllArticles();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-2">Sports AI Blog</h1>
        <p className="text-gray-400 mb-12">AI-powered WM insights every day</p>

        <div className="space-y-8">
          {articles.length > 0 ? (
            articles.map((article) => (
              <Link
                key={article.id}
                href={`/artikel/${article.slug}`}
                className="block bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-slate-500 transition"
              >
                <article>
                  <h2 className="text-3xl font-bold text-white mb-2">{article.title}</h2>
                  <p className="text-gray-400 text-sm mb-4">
                    {new Date(article.createdAt).toLocaleDateString('de-DE')}
                  </p>
                  <p className="text-gray-300 leading-relaxed">{excerpt(article.content, 200)}</p>
                  <span className="inline-block mt-4 text-blue-400 font-medium">Weiterlesen →</span>
                </article>
              </Link>
            ))
          ) : (
            <p className="text-gray-400">Noch keine Artikel vorhanden.</p>
          )}
        </div>
      </div>
    </main>
  );
}
