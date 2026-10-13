# Buscador de productos por SKU

Proyecto independiente de `xml-to-json-feed`. Para Compras, Ventas y otras áreas: busca productos por SKU, permite comparar varios productos y descargar sus fichas PDF (nombre, SKU, imágenes, descripción y atributos).

Solo **consume** la API del feed (`?mode=graphql`); no la modifica ni comparte código con ella.

## Cómo funciona

- `public/index.html`: interfaz, comparación de productos y generación de PDF en el navegador (jsPDF y JSZip).
- `api/search.js`: consulta la API del feed con el token guardado en el servidor. El token nunca llega al navegador. No se piden costos.
- `api/image.js`: proxy de imágenes (solo hosts permitidos) para poder incrustarlas en el PDF.

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `BUSCADOR_PASSWORD` | Sí | Contraseña que se entrega a los usuarios del buscador. |
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
"# buscador-sku-cda" 
