const { authorize } = require('./_lib');

const MAX_BYTES = 5 * 1024 * 1024;

// Solo se descargan imágenes de hosts permitidos (evita que el proxy se use contra otros destinos)
const ALLOWED_HOSTS = (process.env.ALLOWED_IMAGE_HOSTS || 'casadelaudio.com')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

function hostAllowed(hostname) {
    const h = hostname.toLowerCase();
    return ALLOWED_HOSTS.some(a => h === a || h.endsWith('.' + a));
}

// Proxy de imágenes: el navegador no puede leerlas directo del sitio por CORS al armar el PDF
module.exports = async (req, res) => {
    if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Método no permitido' });
    if (!authorize(req, res)) return;

    const query = req.query || Object.fromEntries(new URL(req.url, 'http://localhost').searchParams);
    let target;
    try { target = new URL(String(query.url || '')); } catch (e) {
        return res.status(400).json({ success: false, error: 'URL inválida' });
    }
    if (target.protocol !== 'https:' || !hostAllowed(target.hostname)) {
        return res.status(400).json({ success: false, error: 'Host de imagen no permitido' });
    }

    try {
        const r = await fetch(target, { redirect: 'error', signal: AbortSignal.timeout(15000) });
        if (!r.ok) return res.status(502).json({ success: false, error: `La imagen respondió HTTP ${r.status}` });
        const type = (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
        if (!/^image\/(jpeg|png|webp|gif)$/.test(type)) {
            return res.status(415).json({ success: false, error: 'El recurso no es una imagen soportada' });
        }
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length > MAX_BYTES) return res.status(413).json({ success: false, error: 'Imagen demasiado grande' });
        res.setHeader('Content-Type', type);
        return res.status(200).send(buf);
    } catch (e) {
        return res.status(502).json({ success: false, error: 'No se pudo descargar la imagen' });
    }
};
