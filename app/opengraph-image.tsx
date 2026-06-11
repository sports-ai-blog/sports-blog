import { ImageResponse } from 'next/og';

export const alt = 'Sports AI Blog – WM-Geschichten, Rekorde & Analysen';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #78350f 130%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 110, display: 'flex' }}>⚽</div>
        <div
          style={{
            marginTop: 24,
            fontSize: 72,
            fontWeight: 800,
            display: 'flex',
          }}
        >
          Sports AI Blog
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 32,
            color: '#fbbf24',
            display: 'flex',
          }}
        >
          WM-Geschichten, Rekorde & Analysen – täglich neu
        </div>
      </div>
    ),
    { ...size },
  );
}
