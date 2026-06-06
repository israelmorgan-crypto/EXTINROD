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

async function getCustomerByEmail(supabaseUrl, serviceRoleKey, email) {
  const customerUrl = new URL(`${supabaseUrl}/rest/v1/customers`);
  customerUrl.searchParams.set("email", `eq.${String(email).toLowerCase()}`);
  customerUrl.searchParams.set("select", "id,email,contact_name,company_name");

  const customerResponse = await fetch(customerUrl, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/json",
    },
  });
  const customers = await readJson(customerResponse);
  if (!customerResponse.ok) throw new Error(customers?.message || "No se pudo validar el cliente.");
  return Array.isArray(customers) ? customers[0] : undefined;
}

function cleanText(value, fallback = "") {
  return String(value || fallback).trim();
}

module.exports = async function handler(request, response) {
  const allowedMethods = ["GET", "POST", "DELETE"];
  if (!allowedMethods.includes(request.method)) {
    response.setHeader("Allow", allowedMethods.join(", "));
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
    response.status(401).json({ error: "Inicia sesion para guardar tu lista." });
    return;
  }

  try {
    const user = await getUserFromToken(supabaseUrl, anonKey, accessToken);
    const customer = await getCustomerByEmail(supabaseUrl, serviceRoleKey, user.email);

    if (!customer) {
      response.status(403).json({ error: "No encontramos tu perfil de cliente." });
      return;
    }

    if (request.method === "GET") {
      const wishlistUrl = new URL(`${supabaseUrl}/rest/v1/customer_wishlist_items`);
      wishlistUrl.searchParams.set("customer_id", `eq.${customer.id}`);
      wishlistUrl.searchParams.set("select", "id,external_id,sku,model,brand,name,image_url,product_url,category,created_at");
      wishlistUrl.searchParams.set("order", "created_at.desc");

      const wishlistResponse = await fetch(wishlistUrl, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Accept: "application/json",
        },
      });
      const items = await readJson(wishlistResponse);

      if (!wishlistResponse.ok) {
        response.status(wishlistResponse.status).json({ error: items?.message || "No se pudo leer la lista." });
        return;
      }

      response.status(200).json({ ok: true, items: Array.isArray(items) ? items : [] });
      return;
    }

    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const sku = cleanText(body.sku || body.model);

    if (!sku) {
      response.status(400).json({ error: "Falta el SKU o modelo del producto." });
      return;
    }

    if (request.method === "DELETE") {
      const deleteUrl = new URL(`${supabaseUrl}/rest/v1/customer_wishlist_items`);
      deleteUrl.searchParams.set("customer_id", `eq.${customer.id}`);
      deleteUrl.searchParams.set("sku", `eq.${sku}`);

      const deleteResponse = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });

      if (!deleteResponse.ok) {
        const deleteBody = await readJson(deleteResponse);
        response.status(deleteResponse.status).json({ error: deleteBody?.message || "No se pudo quitar el producto." });
        return;
      }

      response.status(200).json({ ok: true });
      return;
    }

    const payload = {
      customer_id: customer.id,
      external_source: "syscom",
      external_id: cleanText(body.externalId),
      sku,
      model: cleanText(body.model, sku),
      brand: cleanText(body.brand),
      name: cleanText(body.name, sku),
      image_url: cleanText(body.image),
      product_url: cleanText(body.url),
      category: cleanText(body.category),
    };

    const upsertResponse = await fetch(`${supabaseUrl}/rest/v1/customer_wishlist_items?on_conflict=customer_id,external_source,sku`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(payload),
    });
    const saved = await readJson(upsertResponse);

    if (!upsertResponse.ok) {
      response.status(upsertResponse.status).json({ error: saved?.message || "No se pudo guardar el producto." });
      return;
    }

    response.status(200).json({ ok: true, item: Array.isArray(saved) ? saved[0] : saved });
  } catch (error) {
    response.status(500).json({ error: error.message || "No se pudo actualizar la lista." });
  }
};
