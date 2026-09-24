import { getData, saveData } from '../../../../lib/store';
import { isAdminAuthorized } from '../../../../lib/auth';

export async function GET(req) {
  if (!isAdminAuthorized(req)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  const data = await getData();
  return Response.json(data);
}

export async function PUT(req) {
  if (!isAdminAuthorized(req)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const body = await req.json();
    if (!Array.isArray(body.participants)) {
      return Response.json({ error: 'Formato inválido' }, { status: 400 });
    }
    if (!process.env.FOTOS_READ_WRITE_TOKEN && !process.env.BLOB_READ_WRITE_TOKEN) {
      return Response.json(
        {
          error:
            'No hay almacenamiento configurado. En Vercel ve a Storage → Create Database → Blob, conéctalo a este proyecto y vuelve a desplegar.',
        },
        { status: 500 }
      );
    }
    await saveData({ participants: body.participants });
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Error guardando participantes:', err);
    return Response.json(
      { error: 'No se pudo guardar: ' + (err.message || 'error desconocido') },
      { status: 500 }
    );
  }
}
