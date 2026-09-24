export async function POST(req) {
  const { password } = await req.json();
  const real = process.env.ADMIN_PASSWORD;
  if (!real) {
    return Response.json(
      { ok: false, error: 'ADMIN_PASSWORD no está configurada en el proyecto.' },
      { status: 500 }
    );
  }
  if (password !== real) {
    return Response.json({ ok: false, error: 'Clave incorrecta' }, { status: 401 });
  }
  return Response.json({ ok: true });
}
