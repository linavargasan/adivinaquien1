import { getData } from '../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getData();
    const participants = (data.participants || []).map((p) => ({
      id: p.id,
      name: p.name,
      photoUrl: p.photoUrl || null,
      traits: p.traits || {},
    }));
    return Response.json(
      { participants },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err) {
    return Response.json(
      { participants: [], error: err.message },
      { status: 500 }
    );
  }
}
