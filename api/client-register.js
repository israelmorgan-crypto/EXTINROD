async function readJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

async function supabaseFetch(path, options = {}) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Falta configuracion de Supabase en Vercel.");
  }

  return fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...(options.headers || {}),
    },
  });
}

async function supabaseSignup(email, password, metadata) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !anonKey) {
    throw new Error("Falta configuracion publica de Supabase en Vercel.");
  }

  const signupUrl = new URL(`${supabaseUrl}/auth/v1/signup`);
  signupUrl.searchParams.set("redirect_to", "https://extinrod.com/cuenta");

  return fetch(signupUrl, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      data: metadata,
    }),
  });
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  response.setHeader("Cache-Control", "no-store");

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const contactName = String(body.contact_name || "").trim();
    const companyName = String(body.company_name || "").trim();
    const phone = String(body.phone || "").trim();

    if (!email || !password || !contactName) {
      response.status(400).json({ error: "Captura nombre, correo y contrasena." });
      return;
    }

    const userResponse = await supabaseSignup(email, password, {
      full_name: contactName,
      company_name: companyName,
      phone,
      role: "client",
    });
    const userBody = await readJson(userResponse);

    if (!userResponse.ok && !String(userBody?.msg || userBody?.message || "").toLowerCase().includes("already")) {
      response.status(userResponse.status).json({ error: userBody?.msg || userBody?.message || "No se pudo crear el usuario." });
      return;
    }

    const existingResponse = await supabaseFetch(`/rest/v1/customers?email=eq.${encodeURIComponent(email)}&select=id`);
    const existingCustomers = await readJson(existingResponse);
    const existingCustomer = Array.isArray(existingCustomers) ? existingCustomers[0] : undefined;
    const customerPath = existingCustomer
      ? `/rest/v1/customers?id=eq.${existingCustomer.id}`
      : "/rest/v1/customers";
    const customerResponse = await supabaseFetch(customerPath, {
      method: existingCustomer ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        company_name: companyName || contactName,
        contact_name: contactName,
        email,
        phone,
        status: "prospecto",
        sector: "Web",
      }),
    });
    const customers = await readJson(customerResponse);

    if (!customerResponse.ok) {
      response.status(customerResponse.status).json({ error: customers?.message || "No se pudo guardar el cliente." });
      return;
    }

    response.status(200).json({
      ok: true,
      customer: Array.isArray(customers) ? customers[0] : customers,
      message: "Cuenta creada. Revisa tu correo y confirma tu cuenta antes de iniciar sesion.",
    });
  } catch (error) {
    response.status(500).json({ error: error.message || "No se pudo registrar el cliente." });
  }
};
