-- Base de datos de Envases & Frascos Zona Norte.
-- Se corre UNA vez en Supabase: SQL Editor > New query > pegar todo > Run.
-- IMPORTANTE: crear antes el usuario del dueño en Authentication > Users,
-- porque al final este script lo marca como administrador.

-- 1. Productos ---------------------------------------------------------------
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  also_in text[] not null default '{}',
  description text not null default '',
  image text not null default '',
  gallery text[] not null default '{}', -- fotos extra (hasta 9 además de la principal)
  image_fit text not null default 'contain' check (image_fit in ('contain', 'cover')),
  price integer check (price >= 0),
  variants jsonb not null default '[]',
  specs jsonb not null default '[]',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- Para bases creadas antes de que existiera la galería de fotos.
alter table public.products add column if not exists gallery text[] not null default '{}';
alter table public.products drop constraint if exists products_gallery_max;
alter table public.products add constraint products_gallery_max check (coalesce(array_length(gallery, 1), 0) <= 9);

-- 2. Administradores ---------------------------------------------------------
-- Solo los usuarios de esta lista pueden cargar, editar o borrar productos.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 3. Reglas de acceso ----------------------------------------------------------
alter table public.products enable row level security;

drop policy if exists "Cualquiera ve los productos publicados" on public.products;
create policy "Cualquiera ve los productos publicados" on public.products
  for select using (published or public.is_admin());

drop policy if exists "Los administradores cargan productos" on public.products;
create policy "Los administradores cargan productos" on public.products
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Los administradores editan productos" on public.products;
create policy "Los administradores editan productos" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Los administradores borran productos" on public.products;
create policy "Los administradores borran productos" on public.products
  for delete to authenticated using (public.is_admin());

-- Permisos de la API (las reglas de arriba deciden qué fila ve o toca cada uno).
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- 4. Fotos (Storage) -----------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 5242880, array['image/webp', 'image/png', 'image/jpeg'])
on conflict (id) do update set public = true;

drop policy if exists "Los administradores suben fotos" on storage.objects;
create policy "Los administradores suben fotos" on storage.objects
  for insert to authenticated with check (bucket_id = 'productos' and public.is_admin());

drop policy if exists "Los administradores cambian fotos" on storage.objects;
create policy "Los administradores cambian fotos" on storage.objects
  for update to authenticated using (bucket_id = 'productos' and public.is_admin());

drop policy if exists "Los administradores borran fotos" on storage.objects;
create policy "Los administradores borran fotos" on storage.objects
  for delete to authenticated using (bucket_id = 'productos' and public.is_admin());

-- 5. Configuración de la web (por ahora, las fotos del carrusel) ---------------
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

alter table public.settings enable row level security;

drop policy if exists "Cualquiera lee la configuración" on public.settings;
create policy "Cualquiera lee la configuración" on public.settings
  for select using (true);

drop policy if exists "Los administradores cambian la configuración" on public.settings;
create policy "Los administradores cambian la configuración" on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.settings to anon, authenticated;
grant insert, update, delete on public.settings to authenticated;

-- 6. Productos que ya tenía la web --------------------------------------------
insert into public.products
  (id, name, category, also_in, description, image, image_fit, price, variants, specs, published, sort_order)
values
  ('frasco-gigante-corcho', 'Frasco Gigante con tapa de corcho 110 mm', 'alimenticio', array[]::text[], 'Frasco de vidrio con tapa de corcho de 110 mm. Para galletitas, cápsulas y alimentos secos.', 'frascos-gigante-corcho', 'cover', null, '[{"id":"1500cc","label":"1.500 cc","price":null},{"id":"3000cc","label":"3.000 cc","price":null}]'::jsonb, '[{"label":"Artículo","value":"Alimenticio"},{"label":"Modelo","value":"Gigante"},{"label":"Capacidades","value":"1.500 y 3.000 cc"},{"label":"Material","value":"Vidrio"},{"label":"Tapa","value":"Corcho de 110 mm"}]'::jsonb, true, 0),
  ('frasco-tapa-plastica', 'Frasco de vidrio con tapa plástica', 'alimenticio', array[]::text[], 'Frasco de vidrio con tapa plástica, en 1.500 y 3.000 cc. Para conservas y alimentos secos.', 'frascos-tapa-plastica', 'cover', null, '[{"id":"1500cc","label":"1.500 cc","price":null},{"id":"3000cc","label":"3.000 cc","price":null}]'::jsonb, '[{"label":"Artículo","value":"Alimenticio"},{"label":"Capacidades","value":"1.500 y 3.000 cc"},{"label":"Material","value":"Vidrio"},{"label":"Tapa","value":"Plástica"}]'::jsonb, true, 1),
  ('frasco-pvc-gigante', 'Frasco PVC Gigante con tapa blanca', 'alimenticio', array[]::text[], 'Frasco de PVC transparente con tapa blanca, en 1.500 y 3.000 cc.', 'frasco-pvc-gigante', 'contain', null, '[{"id":"1500cc","label":"1.500 cc","price":null},{"id":"3000cc","label":"3.000 cc","price":null}]'::jsonb, '[{"label":"Artículo","value":"Alimenticio"},{"label":"Modelo","value":"Gigante"},{"label":"Capacidades","value":"1.500 y 3.000 cc"},{"label":"Material","value":"PVC"},{"label":"Tapa","value":"Blanca"}]'::jsonb, true, 2),
  ('pote-nacar-ovoide', 'Pote Nácar T / Ovoide', 'perfumeria', array[]::text[], 'Pote color nácar de forma ovoide, en cuatro tamaños. Para perfumería y cosmética.', 'potes-nacar-ovoide', 'contain', null, '[{"id":"60cc","label":"60 cc","price":null},{"id":"30cc","label":"30 cc","price":null},{"id":"20cc","label":"20 cc","price":null},{"id":"15cc","label":"15 cc","price":null}]'::jsonb, '[{"label":"Artículo","value":"Perfumería"},{"label":"Modelo","value":"Nácar T / Ovoide"},{"label":"60 cc","value":"Alto 4 cm, base 5 cm"},{"label":"30 cc","value":"Alto 3,5 cm, base 3,5 cm"},{"label":"20 cc","value":"Alto 3 cm, base 3 cm"},{"label":"15 cc","value":"Alto 2,5 cm, base 2,5 cm"}]'::jsonb, true, 3),
  ('pote-toro-ambar', 'Pote Toro Ámbar', 'cosmetica', array['laboratorio']::text[], 'Pote ámbar con tapa negra a rosca. Para cremas, bálsamos y ungüentos.', 'potes-ambar-tapa-negra', 'contain', null, '[{"id":"100cc","label":"100 cc","price":null},{"id":"50cc","label":"50 cc","price":null},{"id":"30cc","label":"30 cc","price":null},{"id":"15cc","label":"15 cc","price":null}]'::jsonb, '[{"label":"Modelo","value":"Toro Ámbar"},{"label":"Capacidades","value":"100, 50, 30 y 15 cc"},{"label":"Color","value":"Ámbar"},{"label":"Tapa","value":"Negra, a rosca"}]'::jsonb, true, 4),
  ('botella-venecia-250-gatillo', 'Botella Venecia Ámbar 250 cc con gatillo', 'cosmetica', array['limpieza']::text[], 'Botella de 250 cc con gatillo mini trigger. Para brumas, textiles y capilares.', 'botella-venecia-250-gatillo', 'contain', null, '[]'::jsonb, '[{"label":"Artículo","value":"Cosmética"},{"label":"Modelo","value":"Venecia Ámbar"},{"label":"Capacidad","value":"250 cc"},{"label":"Cierre","value":"Gatillo mini trigger"}]'::jsonb, true, 5),
  ('dispenser-vidrio-bomba', 'Dispenser de vidrio con bomba', 'cosmetica', array['limpieza']::text[], 'Frasco de vidrio labrado con válvula dosificadora cromada. Para jabón o crema.', 'dispenser-vidrio-bomba', 'cover', null, '[]'::jsonb, '[{"label":"Artículo","value":"Cosmética"},{"label":"Material","value":"Vidrio labrado"},{"label":"Cierre","value":"Válvula dosificadora cromada"}]'::jsonb, true, 6),
  ('difusor-cubo-110-dorado', 'Difusor Cubo 110 cc capuchón dorado', 'deco-hogar', array[]::text[], 'Frasco cubo de vidrio de 110 cc con capuchón dorado para varillas aromáticas.', 'difusor-cubo-110-dorado', 'contain', null, '[]'::jsonb, '[{"label":"Artículo","value":"Deco Hogar"},{"label":"Modelo","value":"Cubo"},{"label":"Capacidad","value":"110 cc"},{"label":"Material","value":"Vidrio"},{"label":"Cierre","value":"Capuchón dorado"}]'::jsonb, true, 7),
  ('difusor-cubo-plateado', 'Difusor Cubo capuchón plateado', 'deco-hogar', array[]::text[], 'Frasco cubo de vidrio con capuchón plateado para varillas aromáticas.', 'difusor-cubo-plateado', 'cover', null, '[]'::jsonb, '[{"label":"Artículo","value":"Deco Hogar"},{"label":"Modelo","value":"Cubo"},{"label":"Material","value":"Vidrio"},{"label":"Cierre","value":"Capuchón plateado"}]'::jsonb, true, 8),
  ('boticario-chato-fume', 'Difusor Boticario Chato 200 cc fumé', 'deco-hogar', array[]::text[], 'Frasco de vidrio fumé de 200 cc con tapón de corcho, para difusores de varillas.', 'boticario-chato-fume', 'contain', null, '[]'::jsonb, '[{"label":"Artículo","value":"Deco Hogar"},{"label":"Modelo","value":"Boticario Chato"},{"label":"Capacidad","value":"200 cc"},{"label":"Color","value":"Fumé"},{"label":"Cierre","value":"Tapón de corcho"}]'::jsonb, true, 9),
  ('vasito-medidor-15ml', 'Vasito medidor posológico 15 ml', 'laboratorio', array[]::text[], 'Vasito plástico translúcido para dosificar jarabes y líquidos.', 'vasito-medidor-15ml', 'contain', null, '[]'::jsonb, '[{"label":"Artículo","value":"Laboratorio"},{"label":"Capacidad","value":"15 ml"},{"label":"Uso","value":"Medidor posológico"}]'::jsonb, true, 10),
  ('vaso-cilindrico-vidrio', 'Vaso cilíndrico de vidrio', 'varios', array[]::text[], 'Vaso de vidrio cilíndrico en cuatro medidas, de 6 x 10 a 6 x 22.', 'vasos-cilindricos', 'cover', null, '[{"id":"6x10","label":"6 x 10","price":null},{"id":"6x15","label":"6 x 15","price":null},{"id":"6x20","label":"6 x 20","price":null},{"id":"6x22","label":"6 x 22","price":null}]'::jsonb, '[{"label":"Material","value":"Vidrio"},{"label":"Medidas","value":"6 x 10, 6 x 15, 6 x 20 y 6 x 22"}]'::jsonb, true, 11)
on conflict (id) do nothing;

-- 7. El dueño como administrador ------------------------------------------------
-- Se corrió una sola vez, al crear la base, cuando el único usuario era el dueño.
-- Para sumar otro administrador, cambiar el email y correr solo esto:
insert into public.admins (user_id)
select id from auth.users where email = 'EMAIL_DEL_DUEÑO'
on conflict do nothing;

-- Verificación: tiene que mostrar el email del dueño.
select u.email as administrador from public.admins a join auth.users u on u.id = a.user_id;
