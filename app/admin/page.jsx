'use client';

import { useEffect, useState } from 'react';
import { TRAIT_DEFS, emptyTraits } from '../../lib/traits';

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(false);

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [sorteoMsg, setSorteoMsg] = useState('');
  const [sorteando, setSorteando] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    setCheckingAuth(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthError(data.error || 'Clave incorrecta');
        return;
      }
      setAuthorized(true);
      loadParticipants();
    } finally {
      setCheckingAuth(false);
    }
  }

  async function loadParticipants() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/participants', {
        headers: { 'x-admin-password': password },
      });
      const data = await res.json();
      setParticipants(data.participants || []);
    } finally {
      setLoading(false);
    }
  }

  function updatePerson(id, field, value) {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }

  function updateTrait(id, key, value) {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, traits: { ...p.traits, [key]: value } } : p
      )
    );
  }

  function addPerson() {
    setParticipants((prev) => [
      ...prev,
      {
        id: newId(),
        name: '',
        pin: '',
        photoUrl: '',
        secretFriendId: '',
        traits: emptyTraits(),
      },
    ]);
  }

  function removePerson(id) {
    setParticipants((prev) =>
      prev
        .filter((p) => p.id !== id)
        .map((p) => (p.secretFriendId === id ? { ...p, secretFriendId: '' } : p))
    );
  }

  async function uploadPhoto(id, file) {
    setUploadingId(id);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-password': password },
        body: form,
      });
      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: `El servidor respondió con un error inesperado (código ${res.status}).` };
      }
      if (res.ok) {
        updatePerson(id, 'photoUrl', data.url);
      } else {
        alert(data.error || 'No se pudo subir la foto');
      }
    } catch (err) {
      alert('No se pudo subir la foto: ' + (err.message || 'revisa tu conexión'));
    } finally {
      setUploadingId(null);
    }
  }

  async function saveAll() {
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch('/api/admin/participants', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ participants }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: `El servidor respondió con un error inesperado (código ${res.status}).` };
      }
      setSaveMessage(res.ok ? 'Guardado ✓' : data.error || 'Error al guardar');
    } catch (err) {
      setSaveMessage('No se pudo guardar: ' + (err.message || 'revisa tu conexión'));
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(''), 6000);
    }
  }

  async function runSorteo() {
    if (!confirm('¿Hacer el sorteo aleatorio? Esto asigna al azar quién le regala a quién (nadie se regala a sí mismo). Si ya hay un sorteo anterior, se reemplaza.')) return;
    setSorteando(true);
    setSorteoMsg('');
    try {
      const res = await fetch('/api/admin/sorteo', {
        method: 'POST',
        headers: { 'x-admin-password': password },
      });
      let data;
      try { data = await res.json(); } catch { data = { error: 'Error inesperado' }; }
      if (res.ok) {
        setSorteoMsg(`Sorteo listo — ${data.count} participantes asignados ✓`);
        loadParticipants();
      } else {
        setSorteoMsg(data.error || 'Error al sortear');
      }
    } catch (err) {
      setSorteoMsg('Error: ' + (err.message || 'revisa tu conexión'));
    } finally {
      setSorteando(false);
      setTimeout(() => setSorteoMsg(''), 6000);
    }
  }

  if (!authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <h1 className="font-display text-3xl mb-2">Panel del organizador</h1>
          <input
            type="password"
            placeholder="Clave de administrador"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md bg-paper text-pineDark px-3 py-2 outline-none focus:ring-2 focus:ring-gold"
          />
          {authError && <p className="text-berry text-sm">{authError}</p>}
          <button
            type="submit"
            disabled={checkingAuth}
            className="w-full rounded-md bg-gold text-pineDark font-medium py-2.5 disabled:opacity-60"
          >
            {checkingAuth ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Participantes</h1>
          <p className="text-paper/60 text-sm">
            Sube una foto por persona y define sus características. Cuando
            estén todos, haz el sorteo.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {saveMessage && <span className="text-sm text-gold">{saveMessage}</span>}
          {sorteoMsg && <span className="text-sm text-gold">{sorteoMsg}</span>}
          <button
            onClick={saveAll}
            disabled={saving}
            className="rounded-md bg-berry text-paper px-4 py-2 font-medium disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button
            onClick={runSorteo}
            disabled={sorteando || participants.length < 2}
            className="rounded-md bg-gold text-pineDark px-4 py-2 font-medium disabled:opacity-60"
          >
            {sorteando ? 'Sorteando…' : '🎲 Hacer sorteo'}
          </button>
        </div>
      </header>

      {loading ? (
        <p className="text-paper/60">Cargando…</p>
      ) : (
        <div className="space-y-6">
          {participants.map((p) => (
            <div
              key={p.id}
              className="bg-pineDark/60 border border-gold/20 rounded-md p-4 md:p-5"
            >
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex flex-col items-center gap-2 w-28 shrink-0">
                  <div className="w-24 h-24 rounded-md bg-paper/10 overflow-hidden flex items-center justify-center">
                    {p.photoUrl ? (
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-paper/40 text-xs">Sin foto</span>
                    )}
                  </div>
                  <label className="text-xs text-gold cursor-pointer hover:underline">
                    {uploadingId === p.id ? 'Subiendo…' : 'Subir foto'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadPhoto(p.id, file);
                      }}
                    />
                  </label>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-paper/60 mb-1">Nombre</label>
                    <input
                      value={p.name}
                      onChange={(e) => updatePerson(p.id, 'name', e.target.value)}
                      className="w-full rounded-md bg-paper text-pineDark px-2.5 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-paper/60 mb-1">PIN</label>
                    <input
                      value={p.pin}
                      onChange={(e) => updatePerson(p.id, 'pin', e.target.value)}
                      placeholder="4 dígitos"
                      className="w-full rounded-md bg-paper text-pineDark px-2.5 py-1.5 text-sm"
                    />
                  </div>

                  {TRAIT_DEFS.map((def) => (
                    <div key={def.key}>
                      <label className="block text-xs text-paper/60 mb-1">
                        {def.label}
                      </label>
                      <select
                        value={p.traits?.[def.key] || def.options[0]}
                        onChange={(e) => updateTrait(p.id, def.key, e.target.value)}
                        className="w-full rounded-md bg-paper text-pineDark px-2.5 py-1.5 text-sm"
                      >
                        {def.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => removePerson(p.id)}
                  className="self-start text-berry text-xs hover:underline shrink-0"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addPerson}
            className="w-full rounded-md border border-dashed border-gold/40 text-gold py-3 text-sm hover:bg-gold/5"
          >
            + Añadir participante
          </button>
        </div>
      )}
    </main>
  );
}
