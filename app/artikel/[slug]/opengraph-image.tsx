import { ImageResponse } from 'next/og';
import { getAllArticles, getArticleBySlug, SITE_NAME } from '../../../lib/articles';

export const alt = 'Artikelbild';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  const title = article?.displayTitle ?? SITE_NAME;
  const category = article?.category;
  const [from, to] = category?.colors ?? ['#f59e0b', '#ea580c'];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: `linear-gradient(135deg, #0f172a 0%, #1e293b 55%, ${to}66 130%)`,
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700 }}>
            ⚽ {SITE_NAME}
          </div>
          {category && (
            <div
              style={{
                display: 'flex',
                fontSize: 26,
                color: from,
                border: `2px solid ${from}`,
                borderRadius: 999,
                padding: '8px 28px',
              }}
            >
              {category.name}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: title.length > 60 ? 52 : 64,
            fontWeight: 800,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: 'flex',
            height: 14,
            width: '100%',
            borderRadius: 999,
            background: `linear-gradient(90deg, ${from}, ${to})`,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
