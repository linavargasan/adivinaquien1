import { getData } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { guessId } = await req.json();
  if (!guessId) {
    return Response.json({ error: 'Falta el ID' }, { status: 400 });
  }

  const data = await getData();
  const targetId = data.currentTargetId || '';

  if (!targetId) {
    return Response.json(
      { error: 'No hay una ronda activa. El anfitrion debe iniciar una ronda.' },
      { status: 409 }
    );
  }

  const correct = guessId === targetId;

  if (!correct) {
    return Response.json({ correct: false });
  }

  const target = (data.participants || []).find((p) => p.id === targetId);
  return Response.json({
    correct: true,
    name: target?.name || 'Desconocido',
    photoUrl: target?.photoUrl || null,
  });
}
