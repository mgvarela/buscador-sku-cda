# Buscador de productos por SKU

Proyecto independiente de `xml-to-json-feed`. Para Compras, Ventas y otras áreas: busca productos por SKU, permite comparar varios productos y descargar sus fichas PDF (nombre, SKU, imágenes, descripción y atributos).

Solo **consume** la API del feed (`?mode=graphql`); no la modifica ni comparte código con ella.

## Cómo funciona

- `public/index.html`: interfaz, comparación de productos y generación de fichas PDF en el navegador (jsPDF y JSZip).
- `api/search.js`: consulta la API del feed con el token guardado en el servidor. El token nunca llega al navegador. No se piden costos.
- `api/image.js`: proxy de imágenes (solo hosts permitidos) para poder incrustarlas en el PDF.

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `BUSCADOR_PASSWORD_CORPORATIVAS` | Sí | Contraseña compartida por el equipo de Ventas Corporativas. Configurar como variable de entorno del servidor, nunca como `NEXT_PUBLIC_*`. |
| `BUSCADOR_PASSWORD_TIENDAS` | Sí | Contraseña compartida por el equipo de Tiendas. Configurar como variable de entorno del servidor, nunca como `NEXT_PUBLIC_*`. |
| `FEED_API_URL` | Sí | URL de la API del feed, ej. `https://<proyecto-feed>.vercel.app/api/feed`. |
| `FEED_API_TOKEN` | Sí | Valor de `API_SECRET_TOKEN` del proyecto del feed. |
| `ALLOWED_IMAGE_HOSTS` | No | Hosts de imágenes permitidos, separados por coma. Por defecto `casadelaudio.com`. |

## Desarrollo y deploy

```
vercel dev      # local (crear .env.local con las variables)
vercel --prod   # deploy como proyecto aparte
```

`/?sku=XXXX` abre un producto directamente.
Se pueden ingresar varios SKU separados por comas, punto y coma o saltos de línea para compararlos. La comparación permite descargar cada ficha PDF por separado o descargar todas juntas en un archivo ZIP.

## Acceso compartido

Ventas Corporativas y Tiendas ingresan al mismo buscador con sus respectivas contraseñas; ambas habilitan exactamente las mismas funciones. En Vercel, agregá `BUSCADOR_PASSWORD_CORPORATIVAS` y `BUSCADOR_PASSWORD_TIENDAS` en **Settings → Environment Variables**, para cada entorno donde se use la app, y volvé a desplegar. Cada navegador conserva la clave ingresada solo en su propia sesión. No hay cuentas individuales, permisos distintos ni registro de quién realizó cada búsqueda; para revocar el acceso a un grupo, cambiá su clave y desplegá de nuevo.
"# buscador-sku-cda" 
