import { getData } from '../../../lib/store';

export async function POST(req) {
  const { participantId, pin } = await req.json();
  if (!participantId || !pin) {
    return Response.json({ ok: false, error: 'Faltan datos' }, { status: 400 });
  }
  const data = await getData();
  const person = (data.participants || []).find((p) => p.id === participantId);
  if (!person || String(person.pin) !== String(pin)) {
    return Response.json({ ok: false, error: 'PIN incorrecto' }, { status: 401 });
  }
  return Response.json({ ok: true, name: person.name });
}
