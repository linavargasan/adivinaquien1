import { put } from '@vercel/blob';
import { isAdminAuthorized } from '../../../../lib/auth';

export async function POST(req) {
  if (!isAdminAuthorized(req)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return Response.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    const blobToken = process.env.FOTOS_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return Response.json(
        {
          error:
            'No hay almacenamiento configurado. En Vercel ve a Storage → Create Database → Blob, conéctalo a este proyecto y vuelve a desplegar.',
        },
        { status: 500 }
      );
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathname = `fotos/${Date.now()}-${safeName}`;

    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type || 'application/octet-stream',
      token: blobToken,
    });

    return Response.json({ url: blob.url });
  } catch (err) {
    console.error('Error subiendo foto:', err);
    return Response.json(
      { error: 'No se pudo subir la foto: ' + (err.message || 'error desconocido') },
      { status: 500 }
    );
  }
}
