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
  if (message.includes("invalid login credentials")) {
    return "Correo o contrasena incorrectos.";
  }
  if (message.includes("email not confirmed")) {
    return "El correo existe, pero falta confirmarlo en Supabase Auth.";
  }
  if (message.includes("too many")) {
    return "Hubo demasiados intentos. Espera unos minutos e intenta de nuevo.";
  }
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

    const employeeUrl = new URL(`${supabaseUrl}/rest/v1/employees`);
    employeeUrl.searchParams.set("email", `eq.${email}`);
    employeeUrl.searchParams.set("select", "full_name,email,role,active,user_id");

    const employeeResponse = await fetch(employeeUrl, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: "application/json",
      },
    });
    const employees = await readJson(employeeResponse);

    if (!employeeResponse.ok) {
      response.status(employeeResponse.status).json({ error: employees?.message || "No se pudo consultar el empleado." });
      return;
    }

    const employee = Array.isArray(employees) ? employees[0] : undefined;
    if (!employee || !employee.active) {
      response.status(403).json({ error: "Este correo no esta autorizado en el CRM." });
      return;
    }

    if (!employee.user_id) {
      await fetch(employeeUrl, {
        method: "PATCH",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: tokenBody.user.id }),
      });
    }

    response.status(200).json({
      ok: true,
      employee: {
        full_name: employee.full_name,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (error) {
    response.status(500).json({ error: error.message || "No se pudo validar el acceso." });
  }
};
