'use client';

import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [participants, setParticipants] = useState([]);
  const [participantId, setParticipantId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/participants-list')
      .then((r) => r.json())
      .then((d) => setParticipants(d.participants || []))
      .catch(() => setError('No se pudo cargar la lista de participantes.'));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, pin }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'PIN incorrecto');
        setLoading(false);
        return;
      }
      localStorage.setItem('playerId', participantId);
      localStorage.setItem('playerName', data.name);
      window.location.href = '/play';
    } catch {
      setError('Algo salió mal. Intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="text-gold text-sm tracking-wide mb-2">Adivina quién</p>
        <h1 className="font-display text-4xl leading-tight mb-1">Amigo secreto</h1>
        <p className="text-paper/70 mb-8">
          Entra con tu nombre y tu PIN para descubrir a quién le tienes que regalar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-paper/80">Tu nombre</label>
            <select
              required
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              className="w-full rounded-md bg-paper text-pineDark px-3 py-2 outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="">Selecciona tu nombre…</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-paper/80">Tu PIN</label>
            <input
              required
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full rounded-md bg-paper text-pineDark px-3 py-2 outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          {error && <p className="text-berry text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-berry hover:bg-berry/90 text-paper font-medium py-2.5 transition disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar a jugar'}
          </button>
        </form>

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
