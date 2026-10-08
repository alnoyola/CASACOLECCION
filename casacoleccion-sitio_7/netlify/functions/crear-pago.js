// Crea un pago de Mercado Pago (Checkout Pro) para la valuación virtual y regresa su URL.
// Requiere la variable de entorno MP_ACCESS_TOKEN en Netlify. Precio opcional: PRECIO_VALUACION (por defecto 1200).
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: '' };
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return { statusCode: 501, body: JSON.stringify({ error: 'sin_configurar' }) };
  const site = (process.env.URL || '').replace(/\/$/, '');
  let email = '';
  try { email = (JSON.parse(event.body || '{}').email || '').trim(); } catch (e) {}
  const pref = {
    items: [{ title: 'Valuación virtual — Casa Colección', quantity: 1, currency_id: 'MXN', unit_price: Number(process.env.PRECIO_VALUACION || 1200) }],
    back_urls: { success: site + '/?pago=exitoso', pending: site + '/?pago=pendiente', failure: site + '/?pago=fallido' },
    auto_return: 'approved',
    statement_descriptor: 'CASA COLECCION'
  };
  if (email) pref.payer = { email: email };
  try {
    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(pref)
    });
    const d = await r.json();
    if (!r.ok || !d.init_point) return { statusCode: 502, body: JSON.stringify({ error: 'mp' }) };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: d.init_point }) };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: 'red' }) };
  }
};
