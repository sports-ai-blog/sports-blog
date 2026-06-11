import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="text-center">
        <p className="text-7xl">🥅</p>
        <h1 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
          404 – Dieser Schuss ging am Tor vorbei
        </h1>
        <p className="mx-auto mt-4 max-w-md text-slate-400">
          Die Seite, die du suchst, gibt es nicht (mehr). Aber keine Sorge –
          frischer WM-Lesestoff wartet schon.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition-transform hover:scale-105"
        >
          ⚽ Zur Startseite
        </Link>
      </div>
    </main>
  );
}
