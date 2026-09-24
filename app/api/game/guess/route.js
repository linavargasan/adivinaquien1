import { getData } from '../../../../lib/store';

export async function POST(req) {
  const { participantId, guessId } = await req.json();
  const data = await getData();
  const me = (data.participants || []).find((p) => p.id === participantId);
  if (!me) {
    return Response.json({ error: 'Jugador no encontrado' }, { status: 404 });
  }

  const correct = me.secretFriendId === guessId;
  if (!correct) {
    return Response.json({ correct: false });
  }

  const target = (data.participants || []).find((p) => p.id === guessId);
  return Response.json({
    correct: true,
    name: target?.name || 'Desconocido',
    photoUrl: target?.photoUrl || null,
  });
}
