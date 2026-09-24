# Amigo secreto · Adivina quién

App para descubrir el amigo secreto en familia: cada persona entra con su
nombre y un PIN, y va recibiendo pistas sobre las características de la foto
de su amigo secreto hasta adivinar quién es.

- `/` — Entrada de cada jugador (nombre + PIN)
- `/play` — El juego (pistas + tablero de fotos)
- `/admin` — Panel del organizador (agregar personas, fotos, PINs,
  características y quién le regala a quién)

## 1. Requisitos

- Una cuenta gratuita en [vercel.com](https://vercel.com)
- Node.js instalado si quieres probarlo en tu computador antes de publicarlo
  (no es obligatorio, puedes desplegar directo)

## 2. Subir el proyecto a Vercel

**Opción fácil (sin GitHub):**

```bash
npm install -g vercel
cd amigo-secreto
vercel
```

Sigue las instrucciones en pantalla (crea un proyecto nuevo). Al final te da
una URL de prueba.

**Opción con GitHub:** sube esta carpeta a un repositorio y luego en
[vercel.com/new](https://vercel.com/new) elige "Import Project" y selecciona
el repositorio.

## 3. Activar el almacenamiento de fotos (Vercel Blob)

Las fotos y los datos de los participantes se guardan en Vercel Blob (no en
el propio código), así que hay que activarlo una vez por proyecto:

1. En el dashboard de Vercel, entra a tu proyecto.
2. Ve a la pestaña **Storage** → **Create Database** → elige **Blob**.
3. Conéctalo a este proyecto. Vercel agrega automáticamente la variable de
   entorno `BLOB_READ_WRITE_TOKEN`; no tienes que escribirla tú.

## 4. Configurar la clave del organizador

1. En el proyecto, ve a **Settings → Environment Variables**.
2. Agrega `ADMIN_PASSWORD` con la clave que quieras usar para entrar a
   `/admin`.
3. Vuelve a desplegar el proyecto (Deployments → ⋯ → Redeploy) para que la
   variable quede activa.

## 5. Cargar a la familia

1. Entra a `tu-url.vercel.app/admin` con la clave que puso en `ADMIN_PASSWORD`.
2. Por cada persona: agrega su nombre, un PIN (el que ella usará para
   entrar), sube su foto, define sus características (color de cabello, si
   usa gafas, etc.) y elige a quién le regala.
3. Dale a **Guardar cambios**.
4. Comparte el link principal (`tu-url.vercel.app`) con la familia. Cada
   persona entra con su nombre y su PIN, y juega en `/play`.

## Desarrollo local (opcional)

```bash
npm install
vercel link          # conecta esta carpeta con el proyecto en Vercel
vercel env pull .env.local   # trae el token de Blob real
npm run dev
```

## Notas

- Los datos (participantes, fotos, asignaciones) se guardan en un solo
  archivo JSON dentro de tu almacén Blob. Como se pensó para un solo uso, no
  hay que preocuparse por conservarlos después del juego.
- El PIN es solo para que nadie entre casualmente al perfil de otra persona
  en el mismo celular compartido; no es un sistema de seguridad fuerte.
- La identidad del amigo secreto nunca se envía al navegador hasta que el
  jugador confirma correctamente a la persona en el tablero.
