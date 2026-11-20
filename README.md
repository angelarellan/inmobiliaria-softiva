# AURA Bienes Raíces — Web modelo de Softiva Studio

Web modelo de inmobiliaria que Softiva Studio usa para mostrar a inmobiliarias. Incluye la web pública, una ficha con URL propia por propiedad, un asistente para agendar visitas y un panel de administración con usuario demo.

## Stack

- **Next.js 16** (App Router, Server Actions, Route Handlers, Turbopack)
- **Supabase** (Postgres + Storage) con `@supabase/supabase-js`
- **TypeScript**, **Tailwind CSS v4**, **Framer Motion**, **Lucide Icons**
- **Vercel** (hosting + Vercel Cron)

## Puesta en marcha

1. En Supabase → SQL Editor, correr en este orden:
   1. `supabase/migrations/001_inicial.sql` (tablas, RLS y bucket `propiedades`)
   2. `supabase/seed.sql` (propiedades originales y función de reseteo)
2. Copiar `.env.example` a `.env.local` y completar los valores.
3. `npm install` y `npm run dev`.

## Variables de entorno

Ver `.env.example`. La `SUPABASE_SECRET_KEY` solo se usa en el servidor. Si `OWNER_ADMIN_USER` u `OWNER_ADMIN_PASSWORD` están vacías, el ingreso del dueño queda deshabilitado.

## Funcionalidades

- **Catálogo** leído de Supabase con caché por etiqueta: cada alta, edición o baja desde el panel se ve en la home, el buscador y la ficha sin volver a publicar.
- **Ficha por propiedad** en `/propiedades/[slug]`: galería, datos, WhatsApp con título y link, compartir, agendar visita, propiedades similares, Open Graph y JSON-LD.
- **Asistente de visitas** (chat guiado, sin IA): guarda la visita en Supabase y ofrece mandar el resumen por WhatsApp.
- **Panel** en `/admin` con dos usuarios (demo y dueño), sesión firmada con HMAC y límite de intentos fallidos. El usuario demo ve los datos de contacto enmascarados y no puede borrar las propiedades originales.
- **Reseteo nocturno** en `/api/cron/reset-demo` (Vercel Cron, ver `vercel.json`): borra lo que cargó el demo y restaura las originales.
- **Barra "Web modelo"** arriba de todo. Se oculta con `?captura=1` para sacar capturas.

## Scripts

```bash
npm run dev     # servidor de desarrollo
npm run build   # build de producción
npm run start   # servidor de producción
npm run lint    # ESLint
```

## Estructura

```
app/(site)/          Web pública (home, fichas, legales) + asistente
app/admin/           Panel (login, pestañas, alta/edición) y Server Actions
app/api/             Formularios, login, cron de reseteo
components/          UI pública y del panel
lib/data/            Lectura y escritura en Supabase (solo servidor)
lib/auth/            Sesión firmada y límite de intentos
supabase/            SQL de la base y seed
```
