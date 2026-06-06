# EXTINROD Web + CRM

Sitio publico de EXTINROD y base inicial del CRM interno.

## Despliegue recomendado

- Plataforma: Vercel
- Root directory: `sitio_extinrod`
- Framework preset: Other
- Build command: vacio
- Output directory: `.`

## Estructura

- `index.html`, `nosotros.html`, `servicios.html`, `productos.html`, `contacto.html`: sitio publico.
- `crm/`: MVP inicial del panel interno.
- `supabase/schema.sql`: propuesta de base de datos para el CRM real.

## Siguiente etapa

Conectar el CRM a Supabase Auth y PostgreSQL para usuarios, clientes, seguimientos, cotizaciones y productividad.

## Catalogo Syscom

El endpoint `api/products` usa credenciales Syscom en Vercel para consultar productos destacados por familia.

Variables recomendadas:

- `SYSCOM_CLIENT_ID`
- `SYSCOM_CLIENT_SECRET`

Tambien acepta `SYSCOM_API_TOKEN`, pero ese token puede expirar. Con `SYSCOM_CLIENT_ID` y `SYSCOM_CLIENT_SECRET`, el backend genera el token automaticamente.

- Incendios
- Voceo
- Data
- Climas
- Video vigilancia
- Control de accesos
- Intrusion y alarma
- Redes
- Energia y respaldo
- Canalizacion
- Herramientas
- Automatizacion
- Otros destacados

Sin sesion de cliente, el catalogo no expone precios. Con sesion activa, el endpoint puede incluir precio de lista en MXN para adjuntarlo a la solicitud de cotizacion.

Por defecto la pagina solicita hasta 120 productos destacados de Syscom para mantener buena velocidad de carga. El endpoint acepta `?limit=` hasta 1200 para ampliar el volumen en consultas especificas. Primero consulta destacados globales/topseller y los clasifica por familia; si Syscom no devuelve suficiente volumen, usa busquedas por familia como respaldo.

## Fase 1 comercio asistido

- Filtro dinamico por categoria, marca y texto.
- Lista de materiales para clientes con sesion.
- Cajon de cotizacion con precios ocultos en la vista publica.
- Endpoint `api/wishlist` para guardar productos por cliente en Supabase.

Para persistir la lista de materiales en Supabase, ejecutar la version actual de `supabase/schema.sql` o, como minimo, el bloque de `customer_wishlist_items`.
