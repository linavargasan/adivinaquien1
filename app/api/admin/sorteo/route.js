import { getData, saveData } from '../../../../lib/store';
import { isAdminAuthorized } from '../../../../lib/auth';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function assignSecretFriends(participants) {
  const shuffled = shuffle(participants);
  for (let i = 0; i < shuffled.length; i++) {
    const next = (i + 1) % shuffled.length;
    shuffled[i].secretFriendId = shuffled[next].id;
  }
  return shuffled;
}

export async function POST(req) {
  if (!isAdminAuthorized(req)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const data = await getData();
  const participants = data.participants || [];

  if (participants.length < 2) {
    return Response.json(
      { error: 'Se necesitan al menos 2 participantes para hacer el sorteo.' },
      { status: 400 }
    );
  }

  const assigned = assignSecretFriends(participants);
  await saveData({ participants: assigned });

  return Response.json({ ok: true, count: assigned.length });
}
