const fs = require("fs");
const path = require("path");

const SYSCOM_BASE_URL = "https://developers.syscom.mx/api/v1";
const SYSCOM_TOKEN_URL = "https://developers.syscom.mx/oauth/token";

const FEATURED_CATEGORIES = [
  {
    id: "incendios",
    name: "Incendios",
    summary: "Deteccion, paneles, estaciones, sirenas y notificacion.",
    searches: ["panel incendio", "detector humo", "sirena estrobo incendio", "estacion manual incendio", "modulo monitoreo incendio", "fuente nac incendio"],
  },
  {
    id: "voceo",
    name: "Voceo",
    summary: "Audio de evacuacion, amplificadores y mensajes de emergencia.",
    searches: ["amplificador voceo", "audio evacuacion", "bocina plafon", "altavoz evacuacion", "microfono voceo", "amplificador linea 70v"],
  },
  {
    id: "data",
    name: "Data",
    summary: "Cableado estructurado, conectividad, racks y redes.",
    searches: ["cable cat6", "rack gabinete", "patch panel", "jack cat6", "patch cord", "fibra optica"],
  },
  {
    id: "climas",
    name: "Climas",
    summary: "Accesorios y soluciones para aire acondicionado tecnico.",
    searches: ["minisplit", "aire acondicionado", "gabinete aire", "termostato", "kit instalacion minisplit", "aire acondicionado gabinete"],
  },
  {
    id: "videovigilancia",
    name: "Video vigilancia",
    summary: "Camaras IP, NVR, analiticos, PoE y monitoreo.",
    searches: ["camara ip hikvision", "nvr poe", "camara domo ip", "camara bullet ip", "disco duro videovigilancia", "switch poe camaras"],
  },
  {
    id: "accesos",
    name: "Control de accesos",
    summary: "Biometria, cerraduras, lectoras y kits de puerta.",
    searches: ["control acceso", "lector biometrico", "cerradura magnetica", "boton salida", "tarjeta proximidad", "torniquete"],
  },
  {
    id: "intrusion",
    name: "Intrusion y alarma",
    summary: "Paneles, sensores, contactos, sirenas y monitoreo.",
    searches: ["panel alarma", "sensor movimiento", "contacto magnetico", "sirena alarma", "teclado alarma", "detector quiebre cristal"],
  },
  {
    id: "redes",
    name: "Redes",
    summary: "Switches, routers, WiFi, PoE y conectividad empresarial.",
    searches: ["switch poe", "router", "access point", "ubiquiti", "mikrotik", "switch administrable"],
  },
  {
    id: "energia",
    name: "Energia y respaldo",
    summary: "UPS, baterias, fuentes, reguladores y proteccion electrica.",
    searches: ["ups", "bateria 12v", "fuente poder 12v", "regulador voltaje", "supresor picos", "panel solar"],
  },
  {
    id: "canalizacion",
    name: "Canalizacion",
    summary: "Tuberia, charola, canaleta, cajas y accesorios de instalacion.",
    searches: ["canaleta", "tuberia conduit", "charola portacable", "caja registro", "abrazadera conduit", "gabinete nema"],
  },
  {
    id: "herramientas",
    name: "Herramientas",
    summary: "Probadores, ponchadoras, etiquetado, medicion y montaje.",
    searches: ["probador cable", "ponchadora", "multimetro", "etiquetadora", "crimpeadora", "herramienta instalacion"],
  },
  {
    id: "automatizacion",
    name: "Automatizacion",
    summary: "Sensores, control, relevadores, cerramientos y monitoreo tecnico.",
    searches: ["sensor temperatura", "relevador", "controlador", "gabinete industrial", "sensor humedad", "monitoreo ambiental"],
  },
];

function readLocalCatalog() {
  const catalogPath = path.join(process.cwd(), "data", "products.json");
  const raw = fs.readFileSync(catalogPath, "utf8");
  return JSON.parse(raw);
}

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
  if (!supabaseUrl || !anonKey || !token) return null;

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  });
  const user = await readJson(userResponse);
  return userResponse.ok && user?.email ? user : null;
}

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.productos)) return payload.productos;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getProductId(product) {
  return product.producto_id || product.id || product.product_id || product.codigo || product.sku || product.modelo;
}

function getProductImage(product) {
  const image = product.img_portada || product.imagen || product.image || product.thumbnail || "";
  if (typeof image === "string" && image.startsWith("//")) return `https:${image}`;
  return image;
}

function getProductStock(product) {
  return numberOrNull(product.total_existencia ?? product.stock ?? product.existencia_total ?? product.disponible) || 0;
}

function mapSyscomProduct(product, category, exchangeRate, includePrices) {
  const priceList = numberOrNull(product.precios?.precio_lista ?? product.precio_lista ?? product.price);
  const priceListMxn = priceList === null ? null : Math.round(priceList * exchangeRate * 100) / 100;
  const model = String(product.modelo || product.model || product.sku || getProductId(product) || "SIN-MODELO");

  return {
    source: "syscom",
    externalId: String(getProductId(product) || model),
    category: category.id,
    categoryName: category.name,
    name: String(product.titulo || product.nombre || product.name || model),
    model,
    brand: String(product.marca || product.brand || "SYSCOM"),
    image: getProductImage(product),
    url: product.link || product.url || `https://www.syscom.mx/productos?busqueda=${encodeURIComponent(model)}`,
    stock: getProductStock(product),
    description: String(product.descripcion || product.description || category.summary),
    currency: "MXN",
    price: includePrices ? priceListMxn : null,
    listPriceMxn: includePrices ? priceListMxn : null,
  };
}

function mapLocalProduct(product, includePrices) {
  return {
    ...product,
    currency: "MXN",
    price: null,
    listPriceMxn: null,
  };
}

function publicCategoryImage(products, category) {
  const product = products.find((item) => item.category === category.id && item.image);
  return product?.image || "";
}

function getRequestedLimit(request) {
  const requested = Number(request.query?.limit || request.query?.max || 0);
  if (!Number.isFinite(requested) || requested <= 0) return 240;
  return Math.min(Math.max(requested, 24), 600);
}

async function syscomFetch(pathname, token) {
  const response = await fetch(`${SYSCOM_BASE_URL}${pathname}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  const body = await readJson(response);

  if (!response.ok) {
    throw new Error(body?.message || body?.error || `Syscom ${response.status}`);
  }

  return body;
}

async function getSyscomAccessToken() {
  const manualToken = process.env.SYSCOM_API_TOKEN || process.env.SYSCOM_TOKEN || "";
  const clientId = process.env.SYSCOM_CLIENT_ID || "";
  const clientSecret = process.env.SYSCOM_CLIENT_SECRET || "";

  if (!clientId || !clientSecret) return manualToken;

  const response = await fetch(SYSCOM_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });
  const body = await readJson(response);

  if (!response.ok || !body.access_token) {
    if (manualToken) return manualToken;
    throw new Error(body?.message || body?.error || "No se pudo generar token Syscom");
  }

  return body.access_token;
}

async function getExchangeRate(token) {
  try {
    const body = await syscomFetch("/tipocambio", token);
    return numberOrNull(body.normal) || 1;
  } catch {
    return 1;
  }
}

async function getSyscomProducts(token, includePrices, maxProducts) {
  const exchangeRate = await getExchangeRate(token);
  const seen = new Set();
  const products = [];
  const maxPerCategory = Math.max(12, Math.ceil(maxProducts / FEATURED_CATEGORIES.length));

  for (const category of FEATURED_CATEGORIES) {
    let categoryCount = 0;

    for (const search of category.searches) {
      if (categoryCount >= maxPerCategory || products.length >= maxProducts) break;

      const params = new URLSearchParams({
        busqueda: search.replace(/\s+/g, "+"),
        stock: "1",
        orden: "topseller",
        pagina: "1",
      });
      const payload = await syscomFetch(`/productos?${params.toString()}`, token);
      const items = asArray(payload).slice(0, 8);

      for (const item of items) {
        const mapped = mapSyscomProduct(item, category, exchangeRate, includePrices);
        const key = mapped.externalId || mapped.model;
        if (seen.has(key)) continue;
        seen.add(key);
        products.push(mapped);
        categoryCount += 1;
        if (categoryCount >= maxPerCategory || products.length >= maxProducts) break;
      }
    }
  }

  return products;
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const authHeader = request.headers.authorization || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const hasSyscomCredentials = Boolean(
    process.env.SYSCOM_API_TOKEN ||
      process.env.SYSCOM_TOKEN ||
      (process.env.SYSCOM_CLIENT_ID && process.env.SYSCOM_CLIENT_SECRET)
  );
  const maxProducts = getRequestedLimit(request);

  try {
    const user = await getUserFromToken(supabaseUrl, anonKey, accessToken);
    const includePrices = Boolean(user);
    let source = "local-seed";
    let products;

    if (hasSyscomCredentials) {
      try {
        const syscomToken = await getSyscomAccessToken();
        products = await getSyscomProducts(syscomToken, includePrices, maxProducts);
        source = "syscom";
      } catch (error) {
        const catalog = readLocalCatalog();
        products = catalog.products.map((product) => mapLocalProduct(product, includePrices));
        source = `local-seed:${error.message}`;
      }
    } else {
      const catalog = readLocalCatalog();
      products = catalog.products.map((product) => mapLocalProduct(product, includePrices));
    }

    const categories = FEATURED_CATEGORIES.map((category) => ({
      id: category.id,
      name: category.name,
      summary: category.summary,
      image: publicCategoryImage(products, category),
    }));

    response.setHeader("Cache-Control", includePrices ? "no-store" : "s-maxage=300, stale-while-revalidate=3600");
    response.status(200).json({
      source,
      authenticated: includePrices,
      pricesVisible: includePrices,
      updatedAt: new Date().toISOString(),
      categories,
      products,
    });
  } catch (error) {
    response.status(500).json({
      error: "Catalog unavailable",
      detail: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};
