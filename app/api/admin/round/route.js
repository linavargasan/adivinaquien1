import { getData, saveData } from '../../../../lib/store';
import { isAdminAuthorized } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

// GET: returns current round info (for admin view)
export async function GET(req) {
  if (!isAdminAuthorized(req)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  const data = await getData();
  return Response.json({
    targetId: data.currentTargetId || '',
    targetName: data.currentTargetId
      ? (data.participants || []).find((p) => p.id === data.currentTargetId)?.name || ''
      : '',
  });
}

// POST: admin sets the target for the current round
export async function POST(req) {
  if (!isAdminAuthorized(req)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  const { targetId } = await req.json();
  const data = await getData();

  if (!targetId) {
    data.currentTargetId = '';
    await saveData(data);
    return Response.json({ ok: true, cleared: true });
  }

  const person = (data.participants || []).find((p) => p.id === targetId);
  if (!person) {
    return Response.json({ error: 'Persona no encontrada' }, { status: 404 });
  }

  data.currentTargetId = targetId;
  await saveData(data);
  return Response.json({ ok: true, name: person.name });
}
