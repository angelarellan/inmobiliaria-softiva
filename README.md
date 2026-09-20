# AURA Bienes Raíces — Gestión Inmobiliaria Integral

Landing page institucional y sistema web para una inmobiliaria de alto nivel, construida con Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion y Lucide Icons.

## Stack

- **Next.js 16** (App Router, Route Handlers, Turbopack)
- **TypeScript** estricto
- **Tailwind CSS v4**
- **Framer Motion** para animaciones
- **Lucide Icons**

## Funcionalidades

- Landing institucional completa: hero con buscador interactivo, catálogo de propiedades filtrable, ficha de propiedad en modal con galería y CTA de WhatsApp, sección de servicios, formulario de tasaciones, testimonios, formulario de contacto y footer con mapa.
- Panel administrativo simplificado en `/admin` (usuario `admin` / contraseña `admin`) para visualizar consultas, solicitudes de tasación y el listado de propiedades.
- API Routes para los formularios de contacto y tasación, con autenticación de admin basada en cookies.
- SEO: metadata, Open Graph, `sitemap.xml` y `robots.txt`.

## Getting Started

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

## Scripts

```bash
npm run dev     # servidor de desarrollo
npm run build   # build de producción
npm run start   # servidor de producción
npm run lint    # ESLint
```

## Estructura

```
app/                 Rutas (App Router), API routes y páginas de admin
components/          Componentes de UI (landing + admin)
lib/                 Tipos, datos de propiedades, store en memoria y utilidades
```

> Nota: las consultas y tasaciones recibidas se guardan en un store en memoria del servidor (se reinician al reiniciar el proceso). Para producción, reemplazar `lib/store.ts` por una base de datos.
