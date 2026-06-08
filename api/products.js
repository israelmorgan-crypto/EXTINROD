const fs = require("fs");
const path = require("path");

const SYSCOM_BASE_URL = "https://developers.syscom.mx/api/v1";
const SYSCOM_TOKEN_URL = "https://developers.syscom.mx/oauth/token";
const SYSCOM_FETCH_TIMEOUT_MS = 6500;
const PUBLIC_CATALOG_TTL_MS = 45 * 60 * 1000;
const AUTHENTICATED_CATALOG_TTL_MS = 5 * 60 * 1000;
const catalogCache = new Map();

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
  {
    id: "otros",
    name: "Otros destacados",
    summary: "Productos destacados complementarios para integracion de proyectos.",
    searches: ["syscom destacado"],
  },
];

const CATEGORY_RULES = {
  incendios: ["incendio", "fire", "humo", "smoke", "detector", "sirena", "estrobo", "pull", "nac", "notifier", "fire-lite", "system sensor"],
  voceo: ["voceo", "evacuacion", "audio", "amplificador", "bocina", "altavoz", "microfono", "70v", "speaker"],
  data: ["cat6", "cat 6", "cat5", "utp", "patch", "panduit", "cable", "fibra", "rack", "gabinete", "keystone"],
  climas: ["minisplit", "aire acondicionado", "clima", "termostato", "hvac", "ventilador", "hoffman"],
  videovigilancia: ["camara", "camera", "nvr", "dvr", "hikvision", "epcom", "ptz", "cctv", "videovigilancia", "poe"],
  accesos: ["acceso", "biometrico", "zkteco", "cerradura", "magnetica", "lector", "proximidad", "torniquete"],
  intrusion: ["alarma", "intrusion", "motion", "movimiento", "contacto magnetico", "glass", "vista", "resideo"],
  redes: ["switch", "router", "access point", "wifi", "wi-fi", "ubiquiti", "mikrotik", "tp-link", "redes"],
  energia: ["ups", "bateria", "battery", "fuente", "power", "solar", "inversor", "regulador", "supresor"],
  canalizacion: ["canaleta", "conduit", "charola", "tuberia", "registro", "abrazadera", "nema"],
  herramientas: ["herramienta", "probador", "tester", "ponchadora", "crimp", "multimetro", "etiquetadora"],
  automatizacion: ["sensor", "relevador", "relay", "controlador", "automatizacion", "temperatura", "humedad"],
};

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

function cacheKey(includePrices, maxProducts) {
  return `${includePrices ? "auth" : "public"}:${maxProducts}`;
}

function getCachedCatalog(key, ttlMs, allowStale = false) {
  const cached = catalogCache.get(key);
  if (!cached) return null;

  const age = Date.now() - cached.storedAt;
  if (allowStale || age < ttlMs) {
    return {
      ...cached.payload,
      cache: allowStale && age >= ttlMs ? "stale" : "hit",
      stale: allowStale && age >= ttlMs,
    };
  }

  return null;
}

function setCachedCatalog(key, payload) {
  catalogCache.set(key, {
    storedAt: Date.now(),
    payload,
  });
}

async function fetchWithTimeout(url, options = {}, timeoutMs = SYSCOM_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function getUserFromToken(supabaseUrl, anonKey, token) {
  if (!supabaseUrl || !anonKey || !token) return null;

  const userResponse = await fetchWithTimeout(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  }, 4500);
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

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
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

function classifySyscomProduct(product) {
  const text = [
    product.titulo,
    product.nombre,
    product.name,
    product.descripcion,
    product.description,
    product.marca,
    product.brand,
    product.modelo,
    product.model,
    product.categoria,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const category of FEATURED_CATEGORIES) {
    const rules = CATEGORY_RULES[category.id] || [];
    if (rules.some((rule) => text.includes(rule))) return category;
  }

  return FEATURED_CATEGORIES.find((category) => category.id === "otros") || FEATURED_CATEGORIES[0];
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
  if (!Number.isFinite(requested) || requested <= 0) return 120;
  return Math.min(Math.max(requested, 24), 1200);
}

async function syscomFetch(pathname, token) {
  const response = await fetchWithTimeout(`${SYSCOM_BASE_URL}${pathname}`, {
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

  const response = await fetchWithTimeout(SYSCOM_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }).toString(),
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

async function runInBatches(items, batchSize, worker) {
  const results = [];

  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    const batchResults = await Promise.all(batch.map(worker));
    results.push(...batchResults);
  }

  return results;
}

function findSyscomBrand(brandName, syscomBrands) {
  const normalizedBrand = normalizeName(brandName);
  if (!normalizedBrand) return null;

  return (
    syscomBrands.find((brand) => normalizeName(brand.nombre) === normalizedBrand) ||
    syscomBrands.find((brand) => normalizeName(brand.nombre).includes(normalizedBrand)) ||
    syscomBrands.find((brand) => normalizedBrand.includes(normalizeName(brand.nombre)))
  );
}

async function getSyscomBrandLogos(token, products) {
  const brandNames = [...new Set(products.map((product) => product.brand).filter(Boolean))].slice(0, 18);
  if (!brandNames.length) return [];

  const brandsPayload = await syscomFetch("/marcas", token);
  const syscomBrands = asArray(brandsPayload);
  const matchedBrands = brandNames
    .map((brandName) => {
      const match = findSyscomBrand(brandName, syscomBrands);
      return match ? { requestedName: brandName, id: match.id, name: match.nombre || brandName } : null;
    })
    .filter(Boolean);

  const details = await runInBatches(matchedBrands, 6, async (brand) => {
    try {
      const detail = await syscomFetch(`/marcas/${encodeURIComponent(brand.id)}`, token);
      return {
        id: String(brand.id),
        name: detail.nombre || brand.name || brand.requestedName,
        requestedName: brand.requestedName,
        logo: detail.logo || detail.marca_logo || "",
        description: detail.descripcion || "",
      };
    } catch {
      return {
        id: String(brand.id),
        name: brand.name,
        requestedName: brand.requestedName,
        logo: "",
        description: "",
      };
    }
  });

  return details.filter((brand) => brand.logo);
}

async function getSyscomTopSellerProducts(token, includePrices, maxProducts, exchangeRate) {
  const seen = new Set();
  const products = [];
  const pageCount = Math.min(Math.ceil(maxProducts / 10) + 4, 40);
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);
  const payloads = await runInBatches(pages, 6, async (page) => {
    const params = new URLSearchParams({
      stock: "1",
      orden: "topseller",
      pagina: String(page),
    });

    try {
      return await syscomFetch(`/productos?${params.toString()}`, token);
    } catch {
      return {};
    }
  });

  for (const payload of payloads) {
    for (const item of asArray(payload)) {
      const category = classifySyscomProduct(item);
      const mapped = mapSyscomProduct(item, category, exchangeRate, includePrices);
      const key = mapped.externalId || mapped.model;
      if (seen.has(key)) continue;
      seen.add(key);
      products.push(mapped);
      if (products.length >= maxProducts) return products;
    }
  }

  return products;
}

async function getSyscomProducts(token, includePrices, maxProducts) {
  const exchangeRate = await getExchangeRate(token);
  const topSellerProducts = await getSyscomTopSellerProducts(token, includePrices, maxProducts, exchangeRate);

  if (topSellerProducts.length >= Math.min(maxProducts, 60)) {
    return topSellerProducts;
  }

  const seen = new Set();
  const products = [...topSellerProducts];
  topSellerProducts.forEach((product) => seen.add(product.externalId || product.model));
  const maxPerCategory = Math.max(12, Math.ceil(maxProducts / FEATURED_CATEGORIES.length));
  const pagesPerSearch = maxProducts > 400 ? 2 : 1;

  for (const category of FEATURED_CATEGORIES) {
    let categoryCount = 0;

    for (const search of category.searches) {
      if (categoryCount >= maxPerCategory || products.length >= maxProducts) break;

      for (let page = 1; page <= pagesPerSearch; page += 1) {
        if (categoryCount >= maxPerCategory || products.length >= maxProducts) break;

        const params = new URLSearchParams({
          busqueda: search.replace(/\s+/g, "+"),
          stock: "1",
          orden: "topseller",
          pagina: String(page),
        });
        const payload = await syscomFetch(`/productos?${params.toString()}`, token);
        const items = asArray(payload).slice(0, 10);
        if (!items.length) break;

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
  }

  return products;
}

function buildCatalogPayload({ source, includePrices, products, brands, cache = "miss", stale = false }) {
  const categories = FEATURED_CATEGORIES.map((category) => ({
    id: category.id,
    name: category.name,
    summary: category.summary,
    image: publicCategoryImage(products, category),
  }));

  return {
    source,
    cache,
    stale,
    authenticated: includePrices,
    pricesVisible: includePrices,
    updatedAt: new Date().toISOString(),
    categories,
    brands,
    products,
  };
}

function getLocalCatalogPayload(includePrices, source = "local-seed") {
  const catalog = readLocalCatalog();
  return buildCatalogPayload({
    source,
    includePrices,
    products: catalog.products.map((product) => mapLocalProduct(product, includePrices)),
    brands: [],
  });
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
    const key = cacheKey(includePrices, maxProducts);
    const ttlMs = includePrices ? AUTHENTICATED_CATALOG_TTL_MS : PUBLIC_CATALOG_TTL_MS;
    const cachedCatalog = getCachedCatalog(key, ttlMs);

    if (cachedCatalog) {
      response.setHeader("X-EXTINROD-Catalog-Cache", cachedCatalog.cache);
      response.setHeader("Cache-Control", includePrices ? "private, max-age=60" : "s-maxage=1800, stale-while-revalidate=86400");
      response.status(200).json(cachedCatalog);
      return;
    }

    let payload;

    if (hasSyscomCredentials) {
      try {
        const syscomToken = await getSyscomAccessToken();
        const products = await getSyscomProducts(syscomToken, includePrices, maxProducts);
        let brands = [];
        try {
          brands = await getSyscomBrandLogos(syscomToken, products);
        } catch {
          brands = [];
        }
        payload = buildCatalogPayload({
          source: "syscom",
          includePrices,
          products,
          brands,
        });
      } catch (error) {
        const staleCatalog = getCachedCatalog(key, ttlMs, true);
        if (staleCatalog) {
          response.setHeader("X-EXTINROD-Catalog-Cache", "stale");
          response.setHeader("Cache-Control", includePrices ? "private, max-age=60" : "s-maxage=300, stale-while-revalidate=86400");
          response.status(200).json({
            ...staleCatalog,
            source: `${staleCatalog.source}:stale:${error.message}`,
          });
          return;
        }

        payload = getLocalCatalogPayload(includePrices, `local-seed:${error.message}`);
      }
    } else {
      payload = getLocalCatalogPayload(includePrices);
    }

    const isLocalFallback = String(payload.source).startsWith("local-seed:");
    if (!isLocalFallback) setCachedCatalog(key, payload);

    response.setHeader("X-EXTINROD-Catalog-Cache", payload.cache);
    response.setHeader(
      "Cache-Control",
      includePrices ? "private, max-age=60" : isLocalFallback ? "s-maxage=60, stale-while-revalidate=300" : "s-maxage=1800, stale-while-revalidate=86400"
    );
    response.status(200).json(payload);
  } catch (error) {
    response.status(500).json({
      error: "Catalog unavailable",
      detail: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};
