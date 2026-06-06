async function readJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
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
    const userBody = await readJson(userResponse);

    if (!userResponse.ok || !userBody?.id || !userBody?.email) {
      response.status(401).json({ error: "No se pudo validar la sesion del usuario." });
      return;
    }

    const employeeUrl = new URL(`${supabaseUrl}/rest/v1/employees`);
    employeeUrl.searchParams.set("email", `eq.${userBody.email.toLowerCase()}`);

    const employeeResponse = await fetch(employeeUrl, {
      method: "PATCH",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ user_id: userBody.id }),
    });
    const employeeBody = await readJson(employeeResponse);

    if (!employeeResponse.ok) {
      response.status(employeeResponse.status).json({
        error: employeeBody?.message || employeeBody?.error || "No se pudo vincular el empleado.",
      });
      return;
    }

    if (!Array.isArray(employeeBody) || employeeBody.length === 0) {
      response.status(403).json({
        error: `El correo ${userBody.email} inicia sesion, pero no esta dado de alta como empleado activo.`,
      });
      return;
    }

    response.status(200).json({ ok: true, email: userBody.email });
  } catch (error) {
    response.status(500).json({ error: error.message || "No se pudo vincular el empleado." });
  }
};
