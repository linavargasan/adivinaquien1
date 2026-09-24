'use client';

import { useEffect, useState } from 'react';

export default function PlayPage() {
  const [playerId, setPlayerId] = useState(null);
  const [ownName, setOwnName] = useState('');
  const [clues, setClues] = useState([]);
  const [board, setBoard] = useState([]);
  const [revealedCount, setRevealedCount] = useState(1);
  const [discarded, setDiscarded] = useState(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(null); // id being confirmed
  const [wrongId, setWrongId] = useState(null);
  const [result, setResult] = useState(null); // {name, photoUrl}

  useEffect(() => {
    const id = localStorage.getItem('playerId');
    if (!id) {
      window.location.href = '/';
      return;
    }
    setPlayerId(id);
    fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId: id }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Error al cargar el juego');
        setOwnName(data.ownName);
        setClues(data.clues || []);
        setBoard(data.board || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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
        body: JSON.stringify({ participantId: playerId, guessId: id }),
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
        Cargando tu tablero…
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
          <p className="text-gold text-sm tracking-wide mb-3">¡Encontrado!</p>
          <h1 className="font-display text-3xl mb-6">
            Tu amigo secreto es {result.name}
          </h1>
          {result.photoUrl ? (
            <img
              src={result.photoUrl}
              alt={result.name}
              className="w-48 h-48 object-cover rounded-md mx-auto shadow-2xl mb-6"
            />
          ) : null}
          <p className="text-paper/60 text-sm">Ya puedes ir a comprarle su regalo 🎁</p>
        </div>
      </main>
    );
  }

  const activePeople = board.filter((p) => !discarded.has(p.id));

  return (
    <main className="min-h-screen px-4 py-8 md:py-12 max-w-5xl mx-auto">
      <header className="mb-8">
        <p className="text-gold text-sm tracking-wide">Hola, {ownName}</p>
        <h1 className="font-display text-3xl mb-2">Encuentra a tu amigo secreto</h1>
        <p className="text-paper/70 max-w-xl">
          Pide pistas sobre sus características y descarta fotos en el tablero
          tocándolas, hasta que quede la persona correcta. Luego confírmala.
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
          {revealedCount >= clues.length ? 'No hay más pistas' : 'Pedir otra pista'}
        </button>
      </section>

      <section className="corkboard rounded-md p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {board.map((p) => {
            const isDiscarded = discarded.has(p.id);
            const isWrong = wrongId === p.id;
            return (
              <div key={p.id} className="flex flex-col items-center">
                <button
                  onClick={() => toggleDiscard(p.id)}
                  className={`photo-tag relative rounded-sm w-full ${
                    isDiscarded ? 'discarded' : ''
                  } ${isWrong ? 'ring-2 ring-berry' : ''}`}
                  style={{ transform: `rotate(${(p.id.charCodeAt(0) % 5) - 2}deg)` }}
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
                    {checking === p.id ? 'Comprobando…' : 'Es esta persona'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {activePeople.length === 0 && (
          <p className="text-center text-paper/60 text-sm mt-6">
            Descartaste a todos. Toca una foto para volver a mostrarla si te
            equivocaste.
          </p>
        )}
      </section>
    </main>
  );
}
