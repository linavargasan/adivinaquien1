'use client';

import { useEffect, useState } from 'react';

const TRAIT_LABELS = {
  genero: 'Género',
  cabello: 'Color de cabello',
  gafas: '¿Usa gafas?',
  barba: '¿Tiene barba o bigote?',
  edad: 'Rango de edad',
  accesorio: '¿Usa gorra, sombrero o pañoleta?',
  estatura: 'Estatura aproximada',
};

export default function PlayPage() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [phase, setPhase] = useState('setup');
  const [targetId, setTargetId] = useState('');
  const [clues, setClues] = useState([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [discarded, setDiscarded] = useState(new Set());
  const [wrongId, setWrongId] = useState(null);
  const [foundPerson, setFoundPerson] = useState(null);

  useEffect(() => {
    fetch('/api/game')
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Error al cargar');
        setParticipants(data.participants || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function startGame() {
    if (!targetId) return;
    const target = participants.find((p) => p.id === targetId);
    if (!target) return;

    const traitKeys = Object.keys(TRAIT_LABELS);
    const shuffled = traitKeys
      .map((key) => ({
        key,
        label: TRAIT_LABELS[key],
        value: target.traits?.[key] || '—',
      }))
      .sort(() => Math.random() - 0.5);

    setClues(shuffled);
    setRevealedCount(1);
    setDiscarded(new Set());
    setWrongId(null);
    setFoundPerson(null);
    setPhase('playing');
  }

  function toggleDiscard(id) {
    setDiscarded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmGuess(id) {
    setWrongId(null);
    if (id === targetId) {
      const person = participants.find((p) => p.id === id);
      setFoundPerson(person);
      setPhase('found');
    } else {
      setWrongId(id);
      setDiscarded((prev) => new Set(prev).add(id));
    }
  }

  function resetGame() {
    setPhase('setup');
    setTargetId('');
    setClues([]);
    setRevealedCount(0);
    setDiscarded(new Set());
    setWrongId(null);
    setFoundPerson(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-paper/70">
        Cargando tablero…
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

  if (phase === 'found' && foundPerson) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-gold text-sm tracking-wide mb-3">¡Encontrado!</p>
          <h1 className="font-display text-3xl mb-6">
            Tu amigo secreto es {foundPerson.name}
          </h1>
          {foundPerson.photoUrl && (
            <img
              src={foundPerson.photoUrl}
              alt={foundPerson.name}
              className="w-48 h-48 object-cover rounded-md mx-auto shadow-2xl mb-6"
            />
          )}
          <p className="text-paper/60 text-sm mb-8">
            Ya puedes ir a comprarle su regalo 🎁
          </p>
          <button
            onClick={resetGame}
            className="rounded-md bg-gold text-pineDark px-6 py-2.5 font-medium hover:bg-gold/90 transition"
          >
            Siguiente turno
          </button>
        </div>
      </main>
    );
  }

  if (phase === 'setup') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <p className="text-gold text-sm tracking-wide mb-2">Nuevo turno</p>
          <h1 className="font-display text-3xl mb-2">Configurar ronda</h1>
          <p className="text-paper/70 mb-6">
            Anfitrión: selecciona en secreto a la persona que el jugador debe
            adivinar (su amigo secreto). ¡Que el jugador no vea la pantalla!
          </p>

          <label className="block text-sm mb-1 text-paper/80">
            ¿Quién es el amigo secreto?
          </label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full rounded-md bg-paper text-pineDark px-3 py-2 outline-none focus:ring-2 focus:ring-gold mb-6"
          >
            <option value="">Selecciona una persona…</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={startGame}
            disabled={!targetId}
            className="w-full rounded-md bg-berry hover:bg-berry/90 text-paper font-medium py-2.5 transition disabled:opacity-50"
          >
            Comenzar ronda
          </button>

          
            href="/"
            className="block text-center text-paper/40 text-xs mt-8 hover:text-paper/70"
          >
            ← Volver al inicio
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:py-12 max-w-5xl mx-auto">
      <header className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-gold text-sm tracking-wide">Adivina quién</p>
          <h1 className="font-display text-3xl mb-2">
            Encuentra a tu amigo secreto
          </h1>
          <p className="text-paper/70 max-w-xl">
            Pide pistas sobre sus características y descarta fotos tocándolas.
            Cuando creas saber quién es, confírmalo con el botón dorado.
          </p>
        </div>
        <button
          onClick={resetGame}
          className="rounded-md border border-paper/30 text-paper/70 px-3 py-1.5 text-sm hover:bg-paper/10 transition shrink-0"
        >
          Reiniciar turno
        </button>
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
          {participants.map((p) => {
            const isDiscarded = discarded.has(p.id);
            const isWrong = wrongId === p.id;
            return (
              <div key={p.id} className="flex flex-col items-center">
                <button
                  onClick={() => toggleDiscard(p.id)}
                  className={`photo-tag relative rounded-sm w-full ${
                    isDiscarded ? 'discarded' : ''
                  } ${isWrong ? 'ring-2 ring-berry' : ''}`}
                  style={{
                    transform: `rotate(${(p.id.charCodeAt(0) % 5) - 2}deg)`,
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
                    className="mt-2 text-xs rounded-md bg-gold text-pineDark px-2.5 py-1 font-medium hover:bg-gold/90 transition"
                  >
                    Es esta persona
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
