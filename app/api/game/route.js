import { getData } from '../../../lib/store';
import { TRAIT_DEFS } from '../../../lib/traits';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getData();
    const participants = (data.participants || []).map((p) => ({
      id: p.id,
      name: p.name,
      photoUrl: p.photoUrl || null,
    }));

    const targetId = data.currentTargetId || '';
    const target = targetId
      ? (data.participants || []).find((p) => p.id === targetId)
      : null;

    // Build clues from the target's traits (shuffled), without revealing identity
    const clues = target
      ? TRAIT_DEFS.map((def) => ({
          key: def.key,
          label: def.label,
          value: target.traits?.[def.key] || '--',
        })).sort(() => Math.random() - 0.5)
      : [];

    return Response.json(
      {
        participants,
        hasRound: Boolean(target),
        clues,
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err) {
    return Response.json(
      { participants: [], hasRound: false, clues: [], error: err.message },
      { status: 500 }
    );
  }
}
