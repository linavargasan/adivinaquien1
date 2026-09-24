export function isAdminAuthorized(req) {
  const provided = req.headers.get('x-admin-password');
  const real = process.env.ADMIN_PASSWORD;
  return Boolean(real) && provided === real;
}
