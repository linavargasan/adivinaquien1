import { put, list } from '@vercel/blob';

const DB_PATH = 'database.json';

const EMPTY_DB = { participants: [] };

// Busca el token con cualquiera de los dos nombres posibles
function getBlobToken() {
  return (
    process.env.FOTOS_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN ||
    ''
  );
}

export async function getData() {
  try {
    const token = getBlobToken();
    if (!token) return EMPTY_DB;
    const { blobs } = await list({ prefix: DB_PATH, token });
    const dbBlob = blobs.find((b) => b.pathname === DB_PATH);
    if (!dbBlob) return EMPTY_DB;
    const res = await fetch(dbBlob.url, { cache: 'no-store' });
    if (!res.ok) return EMPTY_DB;
    const data = await res.json();
    if (!data || !Array.isArray(data.participants)) return EMPTY_DB;
    return data;
  } catch (err) {
    console.error('No se pudo leer la base de datos en Blob:', err);
    return EMPTY_DB;
  }
}

export async function saveData(data) {
  const token = getBlobToken();
  await put(DB_PATH, JSON.stringify(data), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
}
