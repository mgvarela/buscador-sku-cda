const { authorize } = require('./_lib');

// No se piden costo ni datos internos de logística: el buscador es para uso general
const PRODUCT_FIELDS = `
    sku parent_sku nombre marca categoria url habilitado updated_at
    pricing { precio_lista precio_un_pago cuotas_sin_interes }
    logistica { stock stock_por_sucursal }
    catalogo { descripcion atributos imagenes }`;

async function feedQuery(query, variables) {
    const base = process.env.FEED_API_URL;
    const token = process.env.FEED_API_TOKEN;
    if (!base || !token) throw new Error('FEED_API_URL / FEED_API_TOKEN no configurados en el servidor');

    const url = new URL(base);
    url.searchParams.set('mode', 'graphql');
    const r = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(25000)
    });
    const result = await r.json().catch(() => null);
    if (!result) throw new Error(`Respuesta inválida de la API del feed (HTTP ${r.status})`);
    if (result.errors && !result.data) throw new Error(result.errors[0]?.message || 'Error en la API del feed');
    return result.data;
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Método no permitido' });
    if (!authorize(req, res)) return;

    const query = req.query || Object.fromEntries(new URL(req.url, 'http://localhost').searchParams);
    if (query.ping) return res.status(200).json({ success: true });

    const sku = typeof query.sku === 'string' ? query.sku.trim() : '';
    if (!sku || sku.length > 100) return res.status(400).json({ success: false, error: 'Ingresá un SKU válido' });

    try {
        const data = await feedQuery(
            `query($sku: String!) { product(sku: $sku, include_disabled: true) { ${PRODUCT_FIELDS} } }`, { sku });
        if (data.product) return res.status(200).json({ success: true, product: data.product });

        const alt = await feedQuery(
            `query($q: String) { products(search: $q, limit: 10, include_disabled: true) { sku nombre } }`, { q: sku });
        return res.status(200).json({ success: true, product: null, suggestions: alt.products || [] });
    } catch (e) {
        return res.status(502).json({ success: false, error: e.message });
    }
};
