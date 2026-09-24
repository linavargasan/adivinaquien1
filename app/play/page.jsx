'use client';

import { useEffect, useState } from 'react';

export default function PlayPage() {
  const [participants, setParticipants] = useState([]);
  const [clues, setClues] = useState([]);
  const [hasRound, setHasRound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [revealedCount, setRevealedCount] = useState(1);
  const [discarded, setDiscarded] = useState(new Set());
  const [wrongId, setWrongId] = useState(null);
  const [checking, setChecking] = useState(null);
  const [result, setResult] = useState(null);

  function loadGame() {
    setLoading(true);
    fetch('/api/game')
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Error al cargar');
        setParticipants(data.participants || []);
        setClues(data.clues || []);
        setHasRound(data.hasRound || false);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadGame();
  }, []);

  function newRound() {
    setRevealedCount(1);
    setDiscarded(new Set());
    setWrongId(null);
    setChecking(null);
    setResult(null);
    loadGame();
  }

  function toggleDiscard(id) {
    setDiscarded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function confirmGuess(id) {
    setChecking(id);
    setWrongId(null);
    try {
      const res = await fetch('/api/game/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guessId: id }),
      });
      const data = await res.json();
      if (data.correct) {
        setResult({ name: data.name, photoUrl: data.photoUrl });
      } else {
        setWrongId(id);
        setDiscarded((prev) => new Set(prev).add(id));
      }
    } finally {
      setChecking(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-paper/70">
        Cargando tablero...
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-berry text-center max-w-sm">{error}</p>
      </main>
    );
  }

  if (result) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-gold text-sm tracking-wide mb-3">Adivinaste!</p>
          <h1 className="font-display text-3xl mb-6">
            El amigo secreto es {result.name}
          </h1>
          {result.photoUrl && (
            <img
              src={result.photoUrl}
              alt={result.name}
              className="w-48 h-48 object-cover rounded-md mx-auto shadow-2xl mb-6"
            />
          )}
          <p className="text-paper/60 text-sm mb-8">
            Ya puedes ir a comprarle su regalo
          </p>
          <button
            onClick={newRound}
            className="rounded-md bg-gold text-pineDark px-6 py-2.5 font-medium hover:bg-gold/90 transition"
          >
            Siguiente ronda
          </button>
        </div>
      </main>
    );
  }

  if (!hasRound) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-gold text-sm tracking-wide mb-2">Adivina quien</p>
          <h1 className="font-display text-3xl mb-4">Esperando al anfitrion...</h1>
          <p className="text-paper/70 mb-6">
            El anfitrion debe iniciar una ronda desde el panel de
            administrador para que puedas jugar.
          </p>
          <button
            onClick={newRound}
            className="rounded-md bg-berry text-paper px-5 py-2.5 font-medium hover:bg-berry/90 transition"
          >
            Recargar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:py-12 max-w-5xl mx-auto">
      <header className="mb-8">
        <p className="text-gold text-sm tracking-wide">Adivina quien</p>
        <h1 className="font-display text-3xl mb-2">
          Encuentra al amigo secreto
        </h1>
        <p className="text-paper/70 max-w-xl">
          Pide pistas y descarta fotos tocandolas. Cuando creas saber quien
          es, confirmalo con el boton dorado.
        </p>
      </header>

      <section className="clue-note rounded-md p-4 mb-8">
        <p className="font-medium mb-2">Pistas reveladas</p>
        <ul className="space-y-1 text-sm">
          {clues.slice(0, revealedCount).map((c) => (
            <li key={c.key}>
              <span className="opacity-70">{c.label}:</span>{' '}
              <span className="font-medium">{c.value}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setRevealedCount((n) => Math.min(n + 1, clues.length))}
          disabled={revealedCount >= clues.length}
          className="mt-3 text-sm rounded-md bg-pineDark text-paper px-3 py-1.5 disabled:opacity-40 hover:bg-pineDark/80 transition"
        >
          {revealedCount >= clues.length ? 'No hay mas pistas' : 'Pedir otra pista'}
        </button>
      </section>

      <section className="corkboard rounded-md p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {participants.map((p) => {
            const isDiscarded = discarded.has(p.id);
            const isWrong = wrongId === p.id;
            return (
              <div key={p.id} className="flex flex-col items-center">
                <button
                  onClick={() => toggleDiscard(p.id)}
                  className={
                    'photo-tag relative rounded-sm w-full ' +
                    (isDiscarded ? 'discarded ' : '') +
                    (isWrong ? 'ring-2 ring-berry ' : '')
                  }
                  style={{
                    transform: 'rotate(' + ((p.id.charCodeAt(0) % 5) - 2) + 'deg)',
                  }}
                >
                  <span className="pin absolute -top-1.5 left-1/2 -translate-x-1/2" />
                  <div className="w-full aspect-square bg-pine/20 overflow-hidden mb-2">
                    {p.photoUrl ? (
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-pineDark text-2xl font-display">
                        {p.name[0]}
                      </div>
                    )}
                  </div>
                  <p className="text-pineDark text-sm font-medium text-center truncate">
                    {p.name}
                  </p>
                </button>
                {!isDiscarded && (
                  <button
                    onClick={() => confirmGuess(p.id)}
                    disabled={checking === p.id}
                    className="mt-2 text-xs rounded-md bg-gold text-pineDark px-2.5 py-1 font-medium hover:bg-gold/90 transition disabled:opacity-50"
                  >
                    {checking === p.id ? 'Comprobando...' : 'Es esta persona'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
