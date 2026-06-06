async function readJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

function getDisplayName(user) {
  const metadata = user?.user_metadata || {};
  return metadata.full_name || metadata.name || metadata.user_name || user.email || "Cliente EXTINROD";
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
    response.status(401).json({ error: "Sesion no encontrada." });
    return;
  }

  try {
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const user = await readJson(userResponse);

    if (!userResponse.ok || !user?.email) {
      response.status(401).json({ error: "Sesion de cliente no valida." });
      return;
    }

    const email = String(user.email).toLowerCase();
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
      const displayName = getDisplayName(user);
      const provider = user.app_metadata?.provider || "oauth";
      const createResponse = await fetch(`${supabaseUrl}/rest/v1/customers`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          company_name: displayName,
          contact_name: displayName,
          email,
          phone: user.user_metadata?.phone || "",
          status: "prospecto",
          sector: `Web ${provider}`,
        }),
      });
      const created = await readJson(createResponse);

      if (!createResponse.ok) {
        response.status(createResponse.status).json({ error: created?.message || "No se pudo crear el cliente." });
        return;
      }

      customer = Array.isArray(created) ? created[0] : created;
    }

    response.status(200).json({
      ok: true,
      access_token: accessToken,
      customer,
      user: {
        id: user.id,
        email,
        provider: user.app_metadata?.provider || null,
      },
    });
  } catch (error) {
    response.status(500).json({ error: error.message || "No se pudo validar la sesion." });
  }
};
