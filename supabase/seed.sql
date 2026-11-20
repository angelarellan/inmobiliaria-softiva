-- =============================================================================
-- AURA Bienes Raíces · Web modelo de Softiva Studio
-- seed.sql: las 8 propiedades originales de la web modelo.
--
-- Cómo usarlo: correr DESPUÉS de migrations/001_inicial.sql.
-- Supabase → SQL Editor → New query → pegar todo → Run.
-- Se puede volver a correr: deja las originales como estaban y borra las que
-- cargó el usuario demo (no toca consultas, tasaciones ni visitas).
-- =============================================================================

-- Restaura las propiedades originales. La usa también el reseteo nocturno
-- (/api/cron/reset-demo). Devuelve cuántas borró y cuántas restauró.
create or replace function public.reset_demo_properties()
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  seed_slugs text[];
  deleted_count integer;
  restored_count integer;
begin
  -- 1. Borrar las propiedades que cargó el usuario demo
  delete from public.properties
  where created_by = 'demo' and not is_seed;
  get diagnostics deleted_count = row_count;

  -- 2. Liberar los slugs originales si otra propiedad los estuviera usando
  seed_slugs := array['penthouse-puerto-madero-vista-rio', 'departamento-recoleta-clasico-renovado', 'casa-san-isidro-parque-y-pileta', 'departamento-palermo-chico-alquiler', 'casa-nordelta-laguna-privada', 'departamento-belgrano-alquiler', 'penthouse-puerto-madero-duplex', 'casa-barrio-parque-palermo'];
  update public.properties
     set slug = slug || '-' || substr(id::text, 1, 6)
   where slug = any (seed_slugs) and not is_seed;

  -- 3. Restaurar las originales tal como en el seed
  insert into public.properties (
    id, slug, title, operation, type, currency, price, price_suffix,
    neighborhood, city, address, area, bedrooms, bathrooms, parking,
    images, short_description, description, amenities, featured, position,
    status, is_seed, created_by
  )
  select v.*, 'publicada', true, 'seed'
  from (
    values
      ('00000000-0000-4000-8000-000000000001'::uuid, 'penthouse-puerto-madero-vista-rio', 'Penthouse con vista al río en Puerto Madero', 'Venta', 'Penthouse', 'USD', 1250000, null,
       'Puerto Madero', 'Buenos Aires', 'Av. Alicia Moreau de Justo 1780', 220, 3, 3, 2,
       array['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80']::text[],
       'Piso completo con terraza privada, vistas panorámicas al río y las torres de Catalinas.',
       'Exclusivo penthouse en uno de los edificios más codiciados de Puerto Madero. Living comedor de doble altura con ventanales de piso a techo, cocina integrada de diseño italiano, suite principal con vestidor y terraza de 80 m² con piletín climatizado. Amenities de categoría hotelera y seguridad 24 horas.',
       array['Pileta climatizada', 'Gimnasio equipado', 'Seguridad 24hs', 'Cochera doble', 'Terraza privada', 'SUM con parrilla']::text[],
       true, 1),
      ('00000000-0000-4000-8000-000000000002'::uuid, 'departamento-recoleta-clasico-renovado', 'Departamento clásico renovado en Recoleta', 'Venta', 'Departamento', 'USD', 380000, null,
       'Recoleta', 'Buenos Aires', 'Av. Alvear 1620', 120, 2, 2, 1,
       array['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?auto=format&fit=crop&w=1200&q=80']::text[],
       'Pisos de roble, molduras originales y reforma integral con terminaciones premium.',
       'Departamento de categoría en edificio de la década del 30 totalmente restaurado. Combina el encanto clásico porteño —techos altos, molduras y pisos de roble— con una reforma integral que incorporó instalaciones nuevas, cocina de diseño y baños en mármol travertino. A pasos del Cementerio de la Recoleta y las principales galerías de arte.',
       array['Balcón francés', 'Baulera', 'Cochera', 'Portero 24hs', 'Placares a medida']::text[],
       true, 2),
      ('00000000-0000-4000-8000-000000000003'::uuid, 'casa-san-isidro-parque-y-pileta', 'Casa de estilo en San Isidro con parque y pileta', 'Venta', 'Casa', 'USD', 890000, null,
       'San Isidro', 'Buenos Aires', 'Ruta Panamericana km 28, Barrio Las Lomas', 350, 4, 4, 3,
       array['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80']::text[],
       'Lote de 900 m², parque parquizado, pileta y quincho con parrilla cubierta.',
       'Casa de una planta en barrio residencial de San Isidro, sobre lote de 900 m² con parque maduro. Living con hogar a leña, cocina comedor diario integrada al parque, suite principal en ala independiente y dependencia de servicio. Ideal para familias que buscan tranquilidad sin resignar cercanía a colegios bilingües y clubes de la zona norte.',
       array['Pileta', 'Quincho con parrilla', 'Parque parquizado', 'Hogar a leña', 'Garaje para 3 autos', 'Sistema de riego automático']::text[],
       true, 3),
      ('00000000-0000-4000-8000-000000000004'::uuid, 'departamento-palermo-chico-alquiler', 'Departamento de diseño en Palermo Chico', 'Alquiler', 'Departamento', 'USD', 2800, '/mes',
       'Palermo Chico', 'Buenos Aires', 'Av. Del Libertador 3200', 95, 2, 2, 1,
       array['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80']::text[],
       'Torre premium frente a los bosques de Palermo, totalmente amoblado y equipado.',
       'Unidad de diseño en torre boutique frente a los Bosques de Palermo. Amenities de nivel hotelero, terminaciones de autor y vistas abiertas. Entrega inmediata, apto profesional, ideal para ejecutivos o familias que buscan alquilar en una de las zonas más buscadas de la ciudad.',
       array['Amoblado', 'Pileta en rooftop', 'Gimnasio', 'Laundry', 'Cochera cubierta']::text[],
       true, 4),
      ('00000000-0000-4000-8000-000000000005'::uuid, 'casa-nordelta-laguna-privada', 'Casa sobre laguna en Nordelta', 'Venta', 'Casa', 'USD', 1100000, null,
       'Nordelta', 'Tigre, Buenos Aires', 'Barrio Los Castores, Nordelta', 420, 5, 5, 4,
       array['https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1200&q=80']::text[],
       'Frente a laguna, muelle propio, arquitectura contemporánea y doble altura.',
       'Espectacular residencia contemporánea con frente directo a laguna navegable y muelle propio. Espacios de doble altura, cerramientos de piso a techo que integran el parque con el living, cocina gourmet con isla central y suite principal con vestidor y jacuzzi. Cine en casa, cava y dependencia de servicio completa.',
       array['Muelle propio', 'Pileta a borde infinito', 'Cine en casa', 'Cava', 'Panel solar', 'Seguridad perimetral del barrio']::text[],
       false, 5),
      ('00000000-0000-4000-8000-000000000006'::uuid, 'departamento-belgrano-alquiler', 'Monoambiente premium en Belgrano', 'Alquiler', 'Departamento', 'ARS', 850000, '/mes',
       'Belgrano', 'Buenos Aires', 'Av. Cabildo 2100', 80, 1, 1, 0,
       array['https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=1200&q=80']::text[],
       'Estrenar, luminoso, a metros del subte D y del Barrio Chino.',
       'Unidad a estrenar en edificio boutique de Belgrano R, con excelente orientación y muy buena luz natural. Cocina integrada, placares empotrados y balcón. A pasos de la estación de subte y de la vida gastronómica del Barrio Chino.',
       array['Balcón', 'Laundry en el edificio', 'SUM', 'Seguridad']::text[],
       false, 6),
      ('00000000-0000-4000-8000-000000000007'::uuid, 'penthouse-puerto-madero-duplex', 'Dúplex de lujo en Puerto Madero', 'Venta', 'Penthouse', 'USD', 2100000, null,
       'Puerto Madero', 'Buenos Aires', 'Juana Manso 1550', 310, 4, 4, 3,
       array['https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80']::text[],
       'Dúplex con doble frente, terraza panorámica de 120 m² y acceso privado por ascensor.',
       'Residencia dúplex de autor en la torre más exclusiva del dique. Doble altura en el living principal, escalera flotante, cuatro suites con vestidor y terraza panorámica de 120 m² con vista 360° a la ciudad y el río. Acceso privado por ascensor y bodega climatizada propia.',
       array['Acceso privado por ascensor', 'Terraza panorámica', 'Bodega climatizada', 'Home theater', 'Spa privado', 'Cochera para 3 autos']::text[],
       true, 7),
      ('00000000-0000-4000-8000-000000000008'::uuid, 'casa-barrio-parque-palermo', 'Casa de autor en Barrio Parque', 'Venta', 'Casa', 'USD', 1450000, null,
       'Barrio Parque, Palermo', 'Buenos Aires', 'Cerviño 4100', 380, 4, 3, 2,
       array['https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80']::text[],
       'Arquitectura de autor sobre lote propio en el barrio más verde y exclusivo de Palermo.',
       'Casa de diseño contemporáneo en Barrio Parque, una de las zonas residenciales más exclusivas de la Ciudad. Volúmenes limpios, materiales nobles y un patio interno que ilumina cada ambiente. Living principal de doble altura, estudio independiente y jardín con deck de madera.',
       array['Jardín con deck', 'Estudio independiente', 'Patio interno', 'Cochera para 2 autos', 'Domótica integrada']::text[],
       false, 8)
  ) as v (
    id, slug, title, operation, type, currency, price, price_suffix,
    neighborhood, city, address, area, bedrooms, bathrooms, parking,
    images, short_description, description, amenities, featured, position
  )
  on conflict (id) do update set
    slug              = excluded.slug,
    title             = excluded.title,
    operation         = excluded.operation,
    type              = excluded.type,
    currency          = excluded.currency,
    price             = excluded.price,
    price_suffix      = excluded.price_suffix,
    neighborhood      = excluded.neighborhood,
    city              = excluded.city,
    address           = excluded.address,
    area              = excluded.area,
    bedrooms          = excluded.bedrooms,
    bathrooms         = excluded.bathrooms,
    parking           = excluded.parking,
    images            = excluded.images,
    short_description = excluded.short_description,
    description       = excluded.description,
    amenities         = excluded.amenities,
    featured          = excluded.featured,
    position          = excluded.position,
    status            = excluded.status,
    is_seed           = true,
    created_by        = 'seed';
  get diagnostics restored_count = row_count;

  -- 4. Limpiar intentos de ingreso viejos
  delete from public.login_attempts where created_at < now() - interval '7 days';

  return jsonb_build_object('deleted', deleted_count, 'restored', restored_count);
end;
$$;

-- Solo el servidor (secret key) puede ejecutarla
revoke execute on function public.reset_demo_properties() from public, anon, authenticated;
grant execute on function public.reset_demo_properties() to service_role;

-- Cargar las propiedades originales
select public.reset_demo_properties();
