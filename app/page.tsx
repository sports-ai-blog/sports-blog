import fs from 'fs/promises';
import path from 'path';

interface Article {
  title: string;
  content: string;
  createdAt: string;
  id: number;
}

export default async function Home() {
  let articles: Article[] = [];
  
  try {
    const articlesDir = path.join(process.cwd(), 'articles');
    const files = await fs.readdir(articlesDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(articlesDir, file), 'utf-8');
        const article = JSON.parse(content);
        articles.push(article);
      }
    }
    
    articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.log('No articles yet');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-2">Sports AI Blog</h1>
        <p className="text-gray-400 mb-12">AI-powered WM insights every day</p>
        
        <div className="space-y-8">
          {articles.length > 0 ? (
            articles.map((article) => (
              <article key={article.id} className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-slate-500 transition">
                <h2 className="text-3xl font-bold text-white mb-2">{article.title}</h2>
                <p className="text-gray-400 text-sm mb-4">
                  {new Date(article.createdAt).toLocaleDateString('de-DE')}
                </p>
                <div className="