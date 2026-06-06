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

Sin sesion de cliente, el catalogo no expone precios. Con sesion activa, el endpoint puede incluir precio de lista en MXN para adjuntarlo a la solicitud de cotizacion.

Por defecto la pagina solicita hasta 600 productos destacados de Syscom. El endpoint acepta `?limit=` hasta 1200 para ampliar el volumen sin cambiar el frontend.
