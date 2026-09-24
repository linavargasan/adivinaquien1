import { getData } from '../../../lib/store';
import { TRAIT_DEFS } from '../../../lib/traits';

export async function POST(req) {
  const { participantId } = await req.json();
  const data = await getData();
  const me = (data.participants || []).find((p) => p.id === participantId);
  if (!me) {
    return Response.json({ error: 'Jugador no encontrado' }, { status: 404 });
  }
  const target = (data.participants || []).find((p) => p.id === me.secretFriendId);
  if (!target) {
    return Response.json(
      { error: 'Todavía no tienes un amigo secreto asignado. Pídele al organizador que lo configure.' },
      { status: 409 }
    );
  }

  const clues = TRAIT_DEFS.map((def) => ({
    key: def.key,
    label: def.label,
    value: target.traits?.[def.key] || '—',
  })).sort(() => Math.random() - 0.5);

  const board = (data.participants || [])
    .filter((p) => p.id !== participantId)
    .map((p) => ({ id: p.id, name: p.name, photoUrl: p.photoUrl || null }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));

  return Response.json({ ownName: me.name, clues, board });
}
