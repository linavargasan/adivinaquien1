import { getData } from '../../../lib/store';

export async function GET() {
  const data = await getData();
  const list = (data.participants || [])
    .map((p) => ({ id: p.id, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return Response.json({ participants: list });
}
