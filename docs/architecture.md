# EXTINROD architecture

## Objetivo

Construir una plataforma propia para EXTINROD con cuatro piezas separadas:

- Sitio publico en Vercel.
- Catalogo de productos con fuente Syscom.
- CRM propio para clientes, seguimientos, cotizaciones y productividad.
- Supabase como autenticacion y base de datos.

## Principios

- El frontend nunca guarda tokens de Syscom, Supabase service role ni credenciales sensibles.
- Vercel Functions actuan como capa backend para consultar proveedores y normalizar datos.
- Supabase guarda usuarios, roles, clientes, productos sincronizados, solicitudes y actividad.
- El catalogo publico puede mostrar productos, pero precio final y disponibilidad se confirman en cotizacion.

## Flujo de catalogo

1. La pagina `productos.html` pide datos a `/api/products`.
2. `/api/products` devuelve el catalogo normalizado.
3. Hoy usa `data/products.json` como semilla.
4. Despues consultara Syscom con variables de entorno en Vercel.
5. Supabase guardara productos sincronizados para busqueda, auditoria e historial de precio/stock.

## Flujo de CRM

1. Supabase Auth autentica al empleado.
2. La tabla `employees` define rol y estado activo.
3. RLS limita datos a usuarios autenticados del equipo.
4. Clientes, oportunidades, seguimientos, tareas y cotizaciones viven en Supabase.
5. Las solicitudes desde la web entran a `quote_requests` y se asignan a ventas.

## Siguientes pasos

1. Crear proyecto Supabase y ejecutar `supabase/schema.sql`.
2. Configurar variables en Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SYSCOM_API_TOKEN`
3. Reemplazar el login temporal del CRM por Supabase Auth.
4. Crear endpoint para guardar solicitudes de cotizacion.
5. Crear sincronizador de productos Syscom hacia Supabase.
