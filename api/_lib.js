const crypto = require('crypto');

function safeEqual(a, b) {
    const ha = crypto.createHash('sha256').update(String(a)).digest();
    const hb = crypto.createHash('sha256').update(String(b)).digest();
    return crypto.timingSafeEqual(ha, hb);
}

// Devuelve true si la petición trae la contraseña correcta; si no, responde el error y devuelve false
function authorize(req, res) {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const passwords = [
        process.env.BUSCADOR_PASSWORD_CORPORATIVAS,
        process.env.BUSCADOR_PASSWORD_TIENDAS
    ];
    if (passwords.some(password => !password)) {
        res.status(500).json({
            success: false,
            error: 'BUSCADOR_PASSWORD_CORPORATIVAS y BUSCADOR_PASSWORD_TIENDAS deben estar configuradas en el servidor'
        });
        return false;
    }
    const sent = req.headers['x-access-password'];
    const validCorporatePassword = safeEqual(sent || '', passwords[0]);
    const validStorePassword = safeEqual(sent || '', passwords[1]);
    if (!(validCorporatePassword | validStorePassword)) {
        res.status(401).json({ success: false, error: 'Contraseña inválida' });
        return false;
    }
    return true;
}

module.exports = { authorize };
