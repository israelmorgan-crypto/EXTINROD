async function readJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

function friendlyAuthError(body) {
  const message = String(body?.error_description || body?.msg || body?.message || body?.error || "").toLowerCase();
  if (message.includes("invalid login credentials")) return "Correo o contrasena incorrectos.";
  if (message.includes("email not confirmed")) return "El correo existe, pero falta confirmarlo.";
  return body?.error_description || body?.message || "No se pudo iniciar sesion.";
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
  response.setHeader("Cache-Control", "no-store");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    response.status(500).json({ error: "Falta configuracion de Supabase en Vercel." });
    return;
  }

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      response.status(400).json({ error: "Captura correo y contrasena." });
      return;
    }

    const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const tokenBody = await readJson(tokenResponse);

    if (!tokenResponse.ok || !tokenBody?.user?.id) {
      response.status(401).json({ error: friendlyAuthError(tokenBody) });
      return;
    }

    const customerUrl = new URL(`${supabaseUrl}/rest/v1/customers`);
    customerUrl.searchParams.set("email", `eq.${email}`);
    customerUrl.searchParams.set("select", "id,company_name,contact_name,email,phone,status");

    const customerResponse = await fetch(customerUrl, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: "application/json",
      },
    });
    const customers = await readJson(customerResponse);
    let customer = Array.isArray(customers) ? customers[0] : undefined;

    if (!customer) {
      const createResponse = await fetch(`${supabaseUrl}/rest/v1/customers`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          company_name: tokenBody.user.user_metadata?.company_name || email,
          contact_name: tokenBody.user.user_metadata?.full_name || email,
          email,
          phone: tokenBody.user.user_metadata?.phone || "",
          status: "prospecto",
          sector: "Web",
        }),
      });
      const created = await readJson(createResponse);
      customer = Array.isArray(created) ? created[0] : created;
    }

    response.status(200).json({
      ok: true,
      access_token: tokenBody.access_token,
      customer,
    });
  } catch (error) {
    response.status(500).json({ error: error.message || "No se pudo iniciar sesion." });
  }
};
