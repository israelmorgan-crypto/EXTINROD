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
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const employeeEmail = String(request.query?.employee || "").trim().toLowerCase();
  response.setHeader("Cache-Control", "no-store");

  if (!supabaseUrl || !serviceRoleKey) {
    response.status(500).json({ error: "Falta configuracion de Supabase en Vercel." });
    return;
  }

  try {
    const employeeUrl = new URL(`${supabaseUrl}/rest/v1/employees`);
    employeeUrl.searchParams.set("email", `eq.${employeeEmail}`);
    employeeUrl.searchParams.set("active", "eq.true");
    employeeUrl.searchParams.set("select", "email,role,active");

    const employeeResponse = await fetch(employeeUrl, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: "application/json",
      },
    });
    const employees = await readJson(employeeResponse);
    if (!Array.isArray(employees) || !employees[0]) {
      response.status(401).json({ error: "Sesion CRM no autorizada." });
      return;
    }

    const requestsUrl = new URL(`${supabaseUrl}/rest/v1/quote_requests`);
    requestsUrl.searchParams.set("select", "id,contact_name,email,phone,company_name,message,status,source,created_at,quote_request_items(sku,name,brand,qty)");
    requestsUrl.searchParams.set("order", "created_at.desc");
    requestsUrl.searchParams.set("limit", "50");

    const requestsResponse = await fetch(requestsUrl, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: "application/json",
      },
    });
    const quoteRequests = await readJson(requestsResponse);

    if (!requestsResponse.ok) {
      response.status(requestsResponse.status).json({ error: quoteRequests?.message || "No se pudieron leer solicitudes." });
      return;
    }

    response.status(200).json({ ok: true, quote_requests: quoteRequests });
  } catch (error) {
    response.status(500).json({ error: error.message || "No se pudo cargar el CRM." });
  }
};
