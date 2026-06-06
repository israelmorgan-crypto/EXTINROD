async function readJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

async function getUserFromToken(supabaseUrl, anonKey, token) {
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  });
  const user = await readJson(userResponse);
  if (!userResponse.ok || !user?.email) throw new Error("Sesion de cliente no valida.");
  return user;
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const authHeader = request.headers.authorization || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  response.setHeader("Cache-Control", "no-store");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    response.status(500).json({ error: "Falta configuracion de Supabase en Vercel." });
    return;
  }

  if (!accessToken) {
    response.status(401).json({ error: "Inicia sesion para generar tu cotizacion." });
    return;
  }

  try {
    const user = await getUserFromToken(supabaseUrl, anonKey, accessToken);
    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const items = Array.isArray(body.items) ? body.items : [];
    const message = String(body.message || "").trim();

    if (!items.length && !message) {
      response.status(400).json({ error: "Agrega productos o describe que necesitas cotizar." });
      return;
    }

    const customerUrl = new URL(`${supabaseUrl}/rest/v1/customers`);
    customerUrl.searchParams.set("email", `eq.${String(user.email).toLowerCase()}`);
    customerUrl.searchParams.set("select", "id,company_name,contact_name,email,phone");

    const customerResponse = await fetch(customerUrl, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: "application/json",
      },
    });
    const customers = await readJson(customerResponse);
    const customer = Array.isArray(customers) ? customers[0] : undefined;

    if (!customer) {
      response.status(403).json({ error: "No encontramos tu perfil de cliente." });
      return;
    }

    const quoteResponse = await fetch(`${supabaseUrl}/rest/v1/quote_requests`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        customer_id: customer.id,
        contact_name: customer.contact_name,
        email: customer.email,
        phone: customer.phone,
        company_name: customer.company_name,
        message,
        source: "web",
        status: "nuevo",
      }),
    });
    const quoteBody = await readJson(quoteResponse);

    if (!quoteResponse.ok) {
      response.status(quoteResponse.status).json({ error: quoteBody?.message || "No se pudo guardar la solicitud." });
      return;
    }

    const quoteRequest = Array.isArray(quoteBody) ? quoteBody[0] : quoteBody;
    const itemPayload = items.map((item) => ({
      quote_request_id: quoteRequest.id,
      sku: String(item.model || item.sku || "SIN-SKU"),
      name: String(item.name || item.model || "Producto por definir"),
      brand: String(item.brand || ""),
      qty: Number(item.qty || 1),
      captured_price: item.price ? Number(item.price) : null,
      captured_stock: Number.isFinite(Number(item.stock)) ? Number(item.stock) : null,
    }));

    if (itemPayload.length) {
      await fetch(`${supabaseUrl}/rest/v1/quote_request_items`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemPayload),
      });
    }

    response.status(200).json({ ok: true, quote_request: quoteRequest });
  } catch (error) {
    response.status(500).json({ error: error.message || "No se pudo generar la cotizacion." });
  }
};
