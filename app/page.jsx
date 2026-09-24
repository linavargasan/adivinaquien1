'use client';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <p className="text-gold text-sm tracking-wide mb-2">Adivina quien</p>
        <h1 className="font-display text-4xl leading-tight mb-3">Amigo secreto</h1>
        <p className="text-paper/70 mb-8">
          Descubre quien es el amigo secreto adivinando por sus
          caracteristicas. El anfitrion controla las rondas.
        </p>
        <a
          href="/play"
          className="block w-full rounded-md bg-berry hover:bg-berry/90 text-paper font-medium py-3 transition text-center"
        >
          Empezar a jugar
        </a>
        <a
          href="/admin"
          className="block text-center text-paper/40 text-xs mt-10 hover:text-paper/70"
        >
          Panel del organizador
        </a>
      </div>
    </main>
  );
}
