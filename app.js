let products = [
  {
    category: "incendios",
    categoryName: "Incendios",
    name: "Detector fotoelectrico de humo con temperatura y sirena",
    model: "4WTAB",
    brand: "SYSTEM SENSOR",
    image: "https://ftp3.syscom.mx/usuarios/fotos/2WTAB/2WTAB.jpg",
    url: "https://syscom.mx/producto/4W-TAB-SYSTEM-SENSOR-74963.html",
    stock: 353,
    price: 105.6,
    description: "Detector convencional de 4 hilos con sensor termico, sirena integrada de 85 dB y rechazo de falsas alarmas.",
  },
  {
    category: "incendios",
    categoryName: "Incendios",
    name: "Sirena con senal sonora y luminosa para evacuacion",
    model: "HKSG8015",
    brand: "HIKVISION",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/HIKVISION/HKSG8015/HKSG8015-g.PNG",
    url: "https://syscom.mx/",
    stock: 1,
    price: 19.89,
    description: "Dispositivo de alarma para sistemas de deteccion, con cableado de dos hilos sin polaridad.",
  },
  {
    category: "voceo",
    categoryName: "Voceo",
    name: "Centro de comando de emergencia para voceo y evacuacion",
    model: "ECC50/100",
    brand: "FIRE-LITE",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/FIRE-LITE/ECC50_100/ECC50_100-g.PNG",
    url: "https://syscom.mx/producto/ECC-50/100-FIRE-LITE-85820.html",
    stock: 9,
    price: 3627.07,
    description: "Panel de evacuacion por voz con 50 W de audio, expandible a 100 W y diseno modular.",
  },
  {
    category: "voceo",
    categoryName: "Voceo",
    name: "Amplificador inteligente de 125 W para evacuacion",
    model: "ECS125W",
    brand: "SILENT KNIGHT",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/SILENTKNIGHT/ECS125W/ECS125W-g.jpg",
    url: "https://syscom.mx/producto/ECS125W-SILENT-KNIGHT-BY-HONEYWELL-82464.html",
    stock: 1,
    price: 2536.4,
    description: "Amplificador distribuido para audio de emergencia, con fuente y respaldo de bateria.",
  },
  {
    category: "data",
    categoryName: "Data",
    name: "Bobina de cable UTP Cat 6 cobre, 305 m",
    model: "NUC6C04BUME",
    brand: "PANDUIT",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/PANDUIT/NUC6C04BUME/portada_0S160.PNG",
    url: "https://syscom.mx/producto/NUC6C04BU-ME-PANDUIT-243290.html",
    stock: 500,
    price: 394.73,
    description: "Cable UTP categoria 6, 24 AWG, 1000 Mbps, PVC CM, probado bajo ANSI/TIA-568-C.2.",
  },
  {
    category: "data",
    categoryName: "Data",
    name: "Bobina de cable UTP Cat 6 Riser, 305 m",
    model: "NUR6C04BUC",
    brand: "PANDUIT",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/PANDUIT/NUR6C04BUC/NUR6C04BUC-g.PNG",
    url: "https://syscom.mx/producto/NUR6C04BU-C-PANDUIT-74374.html",
    stock: 500,
    price: 437.33,
    description: "Cable categoria 6 CMR con conductor de cobre solido, marcas de longitud y soporte PoE.",
  },
  {
    category: "climas",
    categoryName: "Climas",
    name: "Terminal a pared para aire acondicionado",
    model: "THACKITTP",
    brand: "THORSMAN",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/THORSMAN/THACKITTP/THACKITTP-g.PNG",
    url: "https://syscom.mx/producto/TH-ACKIT-TP-THORSMAN-242257.html",
    stock: 0,
    price: 12.84,
    description: "Kit modular de PVC para instalacion de sistemas minisplit y canalizacion de accesorios.",
  },
  {
    category: "climas",
    categoryName: "Climas",
    name: "Adaptador Easy Swap Plenum para aire acondicionado",
    model: "PLHC52G57",
    brand: "HOFFMAN",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/HOFFMAN/PLHC52G57/portada_0S160.PNG",
    url: "https://syscom.mx/producto/PLHC52G57-HOFFMAN-240057.html",
    stock: 0,
    price: 830.48,
    description: "Adaptador de acero para reemplazar acondicionadores en gabinetes sin modificar el recorte.",
  },
  {
    category: "videovigilancia",
    categoryName: "Video vigilancia",
    name: "NVR 16 canales IP 4K con 16 puertos PoE+",
    model: "DS7716NXIK4/16P(E)",
    brand: "HIKVISION",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/HIKVISION/DS7716NXIK4/16PE/portada_0S160.PNG",
    url: "https://syscom.mx/producto/DS-7716NXI-K4/16P(E)-HIKVISION-242187.html",
    stock: 184,
    price: 733.13,
    description: "NVR AcuSense con reconocimiento facial, 4 bahias de disco duro y salidas HDMI 4K.",
  },
  {
    category: "videovigilancia",
    categoryName: "Video vigilancia",
    name: "PTZ IP 8 MP 4K, 25X zoom, IR 150 m",
    model: "DS2DE5825IWGE",
    brand: "HIKVISION",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/HIKVISION/DS2DE5825IWGE/DS2DE5825IWGE-g.PNG",
    url: "https://syscom.mx/producto/DS-2DE5825IWG-E-HIKVISION-235661.html",
    stock: 440,
    price: 780,
    description: "Camara PTZ 4K con AcuSeek, AcuSearch, deteccion facial, IR inteligente e IP67.",
  },
  {
    category: "accesos",
    categoryName: "Control de accesos",
    name: "Kit control de acceso con huella, tarjeta y chapa magnetica",
    model: "LF10KITV2",
    brand: "ZKTECO",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/ZKTECO/LF10KITV2/LF10KITV2-g.PNG",
    url: "https://syscom.mx/producto/LF10KITV2-ZKTECO-204864.html",
    stock: 119,
    price: 179.39,
    description: "Kit con lector biometrico, 1,500 huellas, 5,000 tarjetas, TCP/IP y cerradura magnetica.",
  },
  {
    category: "accesos",
    categoryName: "Control de accesos",
    name: "Cerradura con huella, codigo, llave y smartphone",
    model: "89186",
    brand: "YALE-ASSA ABLOY",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/ASSAABLOY/89186/89186-g.png",
    url: "https://syscom.mx/producto/89186-YALE-ASSA-ABLOY-94787.html",
    stock: 0,
    price: 680.65,
    description: "Cerradura inteligente con Bluetooth, lector biometrico, codigos y alarma antiintrusion.",
  },
];

let categories = [
  {
    id: "incendios",
    name: "Incendios",
    summary: "Deteccion, paneles, estaciones, sirenas y notificacion.",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/FIRE-LITE/ES1000X/ES1000X-g.PNG",
  },
  {
    id: "voceo",
    name: "Voceo",
    summary: "Audio de evacuacion, amplificadores y mensajes de emergencia.",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/NOTIFIER/NFC50_100/NFC50_100-g.PNG",
  },
  {
    id: "data",
    name: "Data",
    summary: "Cableado estructurado, conectividad, racks y redes.",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/PANDUIT/NUR6C04BUC/NUR6C04BUC-g.PNG",
  },
  {
    id: "climas",
    name: "Climas",
    summary: "Accesorios y soluciones para aire acondicionado tecnico.",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/HOFFMAN/PLHC52G57/portada_0S160.PNG",
  },
  {
    id: "videovigilancia",
    name: "Video vigilancia",
    summary: "Camaras IP, NVR, analiticos, PoE y monitoreo.",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/HIKVISION/DS2CD1147G2HLIUF/DS2CD1147G2HLIUF-g.PNG",
  },
  {
    id: "accesos",
    name: "Control de accesos",
    summary: "Biometria, cerraduras, lectoras y kits de puerta.",
    image: "https://ftp3.syscom.mx/usuarios/fotos/BancoFotografiasSyscom/ZKTECO/LF10KITV2/LF10KITV2-g.PNG",
  },
];

const grid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const brandFilter = document.querySelector("#brandFilter");
const categoryNav = document.querySelector("#categoryNav");
const categoryVisuals = document.querySelector("#categoryVisuals");
const footerProductNav = document.querySelector("#footerProductNav");
const catalogCount = document.querySelector("#catalogCount");
const cartCount = document.querySelector("#cartCount");
const quoteDrawer = document.querySelector("#quoteDrawer");
const wishlistDrawer = document.querySelector("#wishlistDrawer");
const cartItems = document.querySelector("#cartItems");
const wishlistItems = document.querySelector("#wishlistItems");
const wishlistCount = document.querySelector("#wishlistCount");
const wishlistStatus = document.querySelector("#wishlistStatus");
const quoteWhatsApp = document.querySelector("#quoteWhatsApp");
const quoteRequestForm = document.querySelector("#quoteRequestForm");
const quoteMessage = document.querySelector("#quoteMessage");
const quoteStatus = document.querySelector("#quoteStatus");
let activeCategory = location.hash ? location.hash.slice(1) : "all";
let activeBrand = "all";
let quoteCart = JSON.parse(localStorage.getItem("extinrod_quote_cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("extinrod_wishlist") || "[]");
let catalogPricesVisible = false;

const clientRegisterForm = document.querySelector("#clientRegisterForm");
const clientLoginForm = document.querySelector("#clientLoginForm");
const clientShowRegister = document.querySelector("#clientShowRegister");
const clientRegisterPanel = document.querySelector("#clientRegisterPanel");
const clientAccountStatus = document.querySelector("#clientAccountStatus");
const oauthButtons = document.querySelectorAll("[data-oauth-provider]");
let browserSupabaseClient;

function getClientSession() {
  try {
    return JSON.parse(sessionStorage.getItem("extinrod_client_session") || "null");
  } catch {
    sessionStorage.removeItem("extinrod_client_session");
    return null;
  }
}

function setClientSession(session) {
  sessionStorage.setItem("extinrod_client_session", JSON.stringify(session));
}

function clearClientSession() {
  sessionStorage.removeItem("extinrod_client_session");
}

function setFormStatus(element, message, state = "info") {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("ok", state === "ok");
  element.classList.toggle("error", state === "error");
}

async function linkClientSession(accessToken) {
  const response = await fetch("/api/client-session", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error || "No se pudo validar la sesion.");
  }

  setClientSession(body);
  renderClientStatus();
  return body;
}

async function getBrowserSupabaseClient() {
  if (browserSupabaseClient) return browserSupabaseClient;

  const configResponse = await fetch("/api/config", { cache: "no-store" });
  const config = await configResponse.json().catch(() => ({}));
  const supabaseConfig = config?.supabase || {};

  if (!supabaseConfig.configured || !supabaseConfig.url || !supabaseConfig.anonKey) {
    throw new Error("Falta configuracion publica de Supabase para iniciar sesion con este proveedor.");
  }

  if (!window.supabase?.createClient) {
    throw new Error("No se cargo el cliente de Supabase. Recarga la pagina e intenta de nuevo.");
  }

  browserSupabaseClient = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
  return browserSupabaseClient;
}

async function startClientOAuth(provider) {
  try {
    const client = await getBrowserSupabaseClient();
    const { error } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: "https://extinrod.com/cuenta",
        skipBrowserRedirect: false,
      },
    });

    if (error) throw error;
  } catch (error) {
    alert(error.message || "No se pudo iniciar sesion con este proveedor.");
  }
}

async function handleClientOAuthReturn() {
  if (!clientLoginForm) return;

  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "");
  const error = urlParams.get("error_description") || urlParams.get("error") || hashParams.get("error_description") || hashParams.get("error");

  if (error) {
    window.history.replaceState({}, document.title, window.location.pathname);
    alert(decodeURIComponent(error));
    return;
  }

  let session;
  try {
    const client = await getBrowserSupabaseClient();
    const result = await client.auth.getSession();
    session = result?.data?.session;
  } catch (error) {
    if (window.location.hash || window.location.search) {
      alert(error.message || "No se pudo completar el inicio de sesion.");
    }
    return;
  }

  const accessToken = session?.access_token || hashParams.get("access_token");
  if (!accessToken) return;

  try {
    await linkClientSession(accessToken);
    window.history.replaceState({}, document.title, window.location.pathname);
  } catch (error) {
    alert(error.message || "No se pudo completar el inicio de sesion.");
  }
}

function renderClientStatus() {
  if (!clientAccountStatus) return;
  const session = getClientSession();

  if (!session?.customer) {
    clientAccountStatus.innerHTML = `
      <p class="eyebrow">Estado</p>
      <h2>Sin sesión activa</h2>
      <p>Inicia sesión para enviar tu carrito de productos como solicitud de cotización.</p>
      <a class="button primary" href="productos.html">Ver productos</a>
    `;
    return;
  }

  clientAccountStatus.innerHTML = `
    <p class="eyebrow">Sesión activa</p>
    <h2>${session.customer.company_name || session.customer.contact_name}</h2>
    <p>${session.customer.contact_name || ""}<br />${session.customer.email}</p>
    <a class="button primary" href="productos.html">Generar cotización</a>
    <button class="button secondary" type="button" data-client-logout>Cerrar sesión</button>
  `;
}

const slides = document.querySelectorAll(".hero-slide");
const dotsHost = document.querySelector(".slider-dots");
const nextButton = document.querySelector("[data-slide-next]");
const prevButton = document.querySelector("[data-slide-prev]");
let activeSlide = 0;
let slideTimer;

function money(value) {
  if (!Number.isFinite(Number(value))) return "Por cotizar";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function productCode(product) {
  return String(product.model || product.sku || product.externalId || product.name || "").trim();
}

function decodeProductCode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function productByCode(code) {
  return products.find((item) => productCode(item) === code);
}

function persistWishlist() {
  localStorage.setItem("extinrod_wishlist", JSON.stringify(wishlist));
}

function isWishlisted(product) {
  const code = productCode(product);
  return wishlist.some((item) => String(item.sku || item.model) === code);
}

function wishlistPayload(product) {
  return {
    externalId: product.externalId || "",
    sku: productCode(product),
    model: product.model || productCode(product),
    brand: product.brand || "",
    name: product.name || product.model || "Producto",
    image: product.image || "",
    url: product.url || "",
    category: product.category || "",
    categoryName: product.categoryName || "",
  };
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function productMatches(product, query) {
  const text = normalize(`${product.name} ${product.model} ${product.brand} ${product.categoryName}`);
  return text.includes(normalize(query));
}

function filteredProducts() {
  const query = searchInput.value.trim();
  return products.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesBrand = activeBrand === "all" || product.brand === activeBrand;
    const matchesQuery = query === "" || productMatches(product, query);
    return matchesCategory && matchesBrand && matchesQuery;
  });
}

function syncButtons() {
  document.querySelectorAll(".category-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === activeCategory);
  });
}

function renderBrandFilter() {
  if (!brandFilter) return;
  const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  const previous = activeBrand;
  brandFilter.innerHTML = [
    '<option value="all">Todas las marcas</option>',
    ...brands.map((brand) => `<option value="${brand}">${brand}</option>`),
  ].join("");
  activeBrand = brands.includes(previous) ? previous : "all";
  brandFilter.value = activeBrand;
}

function renderProducts() {
  syncButtons();
  const items = filteredProducts();

  if (catalogCount) {
    catalogCount.textContent = `${items.length} de ${products.length} productos destacados`;
  }

  if (!items.length) {
    grid.innerHTML = '<p class="empty-state">No encontramos productos con ese filtro.</p>';
    return;
  }

  grid.innerHTML = items
    .map(
      (product) => {
        const code = productCode(product);
        const encodedCode = encodeURIComponent(code);
        const saved = isWishlisted(product);
        return `
        <article class="product-card" id="${product.category}">
          <div class="product-media">
            <img src="${product.image}" alt="${product.model} ${product.brand}" loading="lazy" />
          </div>
          <div class="product-body">
            <div class="product-meta">
              <span>${product.brand}</span>
              <span>${product.model}</span>
            </div>
            <span class="category-tag">${product.categoryName}</span>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <span class="stock ${product.stock > 0 ? "" : "out"}">
              ${product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
            </span>
            <div class="price-row">
              <span class="price">Precio al cotizar</span>
              <div class="product-actions">
                <button class="save-link ${saved ? "saved" : ""}" type="button" data-wishlist-product="${encodedCode}">${saved ? "Guardado" : "Guardar"}</button>
                <button class="detail-link" type="button" data-add-product="${encodedCode}">Agregar</button>
              </div>
            </div>
          </div>
        </article>
      `;
      }
    )
    .join("");
}

function persistCart() {
  localStorage.setItem("extinrod_quote_cart", JSON.stringify(quoteCart));
}

function updateCart() {
  if (!cartCount || !cartItems || !quoteWhatsApp) return;
  const totalItems = quoteCart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalItems;

  if (!quoteCart.length) {
    cartItems.innerHTML = '<p class="empty-state">Aun no agregas productos.</p>';
    quoteWhatsApp.href = "contacto.html";
    return;
  }

  const session = getClientSession();
  const showCartPrices = Boolean(session?.access_token);
  cartItems.innerHTML = quoteCart
    .map(
      (item) => {
        const encodedCode = encodeURIComponent(item.model || item.sku);
        return `
        <article class="cart-line">
          <div>
            <strong>${item.model}</strong>
            <span>${item.name}</span>
            ${showCartPrices && item.listPriceMxn ? `<small>Precio lista: ${money(item.listPriceMxn)} MXN</small>` : "<small>Precio al validar cotizacion</small>"}
          </div>
          <div class="cart-actions">
            <button type="button" data-dec-product="${encodedCode}">-</button>
            <span>${item.qty}</span>
            <button type="button" data-inc-product="${encodedCode}">+</button>
          </div>
        </article>
      `;
      }
    )
    .join("");

  const lines = quoteCart.map((item) => `${item.qty} x ${item.model} - ${item.name}`).join("%0A");
  quoteWhatsApp.href = `https://wa.me/525536191672?text=Hola%20EXTINROD,%20quiero%20cotizar:%0A${lines}`;
}

function updateWishlist() {
  if (wishlistCount) wishlistCount.textContent = wishlist.length;
  if (!wishlistItems) return;

  if (!wishlist.length) {
    wishlistItems.innerHTML = '<p class="empty-state">Todavia no guardas productos.</p>';
    return;
  }

  wishlistItems.innerHTML = wishlist
    .map(
      (item) => `
        <article class="cart-line wishlist-line">
          <img src="${item.image || "assets/logo-extinrod.png"}" alt="${item.model || item.sku}" loading="lazy" />
          <div>
            <strong>${item.model || item.sku}</strong>
            <span>${item.name}</span>
            <small>${item.brand || "Marca por confirmar"}</small>
          </div>
          <div class="cart-actions single-action">
            <button type="button" data-remove-wishlist="${encodeURIComponent(item.sku || item.model)}">x</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderCategoryVisuals() {
  if (!categoryVisuals) return;

  categoryVisuals.innerHTML = categories
    .map(
      (category) => `
        <button class="visual-category" data-category="${category.id}" type="button">
          <img src="${category.image}" alt="${category.name}" loading="lazy" />
          <span>${category.name}</span>
          <small>${category.summary}</small>
        </button>
      `
    )
    .join("");

  categoryVisuals.querySelectorAll(".visual-category").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      history.replaceState(null, "", `#${activeCategory}`);
      renderProducts();
    });
  });
}

function selectCategory(categoryId) {
  activeCategory = categoryId;
  history.replaceState(null, "", activeCategory === "all" ? "productos.html" : `#${activeCategory}`);
  renderProducts();
}

function renderCategoryNav() {
  if (!categoryNav) return;

  categoryNav.innerHTML = [
    '<button class="category-button active" data-category="all" type="button">Todos</button>',
    ...categories.map((category) => `<button class="category-button" data-category="${category.id}" type="button">${category.name}</button>`),
  ].join("");

  categoryNav.querySelectorAll(".category-button").forEach((button) => {
    button.addEventListener("click", () => selectCategory(button.dataset.category));
  });

  syncButtons();
}

function renderFooterProductNav() {
  if (!footerProductNav) return;

  footerProductNav.innerHTML = [
    "<h3>Productos</h3>",
    ...categories.map((category) => `<a href="#${category.id}">${category.name}</a>`),
  ].join("");
}

function renderCategorySurfaces() {
  renderCategoryNav();
  renderCategoryVisuals();
  renderFooterProductNav();
}

function addToCart(model) {
  const product = productByCode(decodeProductCode(model));
  if (!product) return;
  const code = productCode(product);
  const existing = quoteCart.find((item) => item.model === code || item.sku === code);
  if (existing) {
    existing.qty += 1;
  } else {
    quoteCart.push({
      model: product.model,
      sku: product.model,
      name: product.name,
      brand: product.brand,
      qty: 1,
      price: product.listPriceMxn || product.price || null,
      listPriceMxn: product.listPriceMxn || product.price || null,
      stock: product.stock,
      source: product.source || "catalog",
      externalId: product.externalId || "",
    });
  }
  persistCart();
  updateCart();
  quoteDrawer?.classList.add("open");
  quoteDrawer?.setAttribute("aria-hidden", "false");
}

function changeCartQty(model, delta) {
  const code = decodeProductCode(model);
  quoteCart = quoteCart
    .map((item) => (item.model === code || item.sku === code ? { ...item, qty: item.qty + delta } : item))
    .filter((item) => item.qty > 0);
  persistCart();
  updateCart();
}

async function syncWishlistItem(method, item) {
  const session = getClientSession();
  if (!session?.access_token) return false;

  const response = await fetch("/api/wishlist", {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(item),
  });

  return response.ok;
}

async function loadWishlistFromApi() {
  const session = getClientSession();
  if (!session?.access_token) {
    updateWishlist();
    return;
  }

  try {
    const response = await fetch("/api/wishlist", {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(body.items)) {
      updateWishlist();
      return;
    }

    wishlist = body.items.map((item) => ({
      externalId: item.external_id || "",
      sku: item.sku,
      model: item.model || item.sku,
      brand: item.brand || "",
      name: item.name,
      image: item.image_url || "",
      url: item.product_url || "",
      category: item.category || "",
      categoryName: item.category || "",
    }));
    persistWishlist();
    updateWishlist();
    renderProducts();
  } catch {
    updateWishlist();
  }
}

async function toggleWishlist(model) {
  const session = getClientSession();
  if (!session?.access_token) {
    setFormStatus(wishlistStatus, "Inicia sesion para guardar tu lista de materiales.", "error");
    wishlistDrawer?.classList.add("open");
    wishlistDrawer?.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      window.location.href = "https://extinrod.com/cuenta";
    }, 1000);
    return;
  }

  const product = productByCode(decodeProductCode(model));
  if (!product) return;
  const item = wishlistPayload(product);
  const exists = wishlist.some((saved) => String(saved.sku || saved.model) === item.sku);

  if (exists) {
    wishlist = wishlist.filter((saved) => String(saved.sku || saved.model) !== item.sku);
    persistWishlist();
    updateWishlist();
    renderProducts();
    await syncWishlistItem("DELETE", { sku: item.sku });
    return;
  }

  wishlist = [item, ...wishlist.filter((saved) => String(saved.sku || saved.model) !== item.sku)];
  persistWishlist();
  updateWishlist();
  renderProducts();
  wishlistDrawer?.classList.add("open");
  wishlistDrawer?.setAttribute("aria-hidden", "false");
  setFormStatus(wishlistStatus, "Producto guardado en tu lista de materiales.", "ok");
  await syncWishlistItem("POST", item);
}

function wishlistToCart() {
  wishlist.forEach((item) => {
    const product = productByCode(item.sku || item.model);
    if (product) {
      addToCart(productCode(product));
      return;
    }

    const code = String(item.sku || item.model);
    const existing = quoteCart.find((cartItem) => cartItem.model === code || cartItem.sku === code);
    if (existing) {
      existing.qty += 1;
      return;
    }

    quoteCart.push({
      model: item.model || code,
      sku: code,
      name: item.name || code,
      brand: item.brand || "",
      qty: 1,
      price: null,
      listPriceMxn: null,
      stock: null,
      source: "wishlist",
      externalId: item.externalId || "",
    });
  });
  persistCart();
  updateCart();
  wishlistDrawer?.classList.remove("open");
  wishlistDrawer?.setAttribute("aria-hidden", "true");
  quoteDrawer?.classList.add("open");
  quoteDrawer?.setAttribute("aria-hidden", "false");
}

async function loadProductsFromApi() {
  try {
    const session = getClientSession();
    const headers = { Accept: "application/json" };
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

    const response = await fetch("/api/products?limit=120", { headers });
    if (!response.ok) return;

    const catalog = await response.json();
    if (!Array.isArray(catalog.products) || catalog.products.length === 0) return;

    products = catalog.products;
    catalogPricesVisible = Boolean(catalog.pricesVisible);
    if (Array.isArray(catalog.categories) && catalog.categories.length) {
      categories = catalog.categories;
      renderCategorySurfaces();
    }
    renderBrandFilter();
    renderProducts();
    updateCart();
    loadWishlistFromApi();
  } catch {
    renderProducts();
  }
}

if (grid && searchInput) {
  renderCategorySurfaces();

  searchInput.addEventListener("input", renderProducts);
  brandFilter?.addEventListener("change", () => {
    activeBrand = brandFilter.value;
    renderProducts();
  });
  grid.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-product]");
    const wishlistButton = event.target.closest("[data-wishlist-product]");
    if (addButton) addToCart(addButton.dataset.addProduct);
    if (wishlistButton) toggleWishlist(wishlistButton.dataset.wishlistProduct);
  });

  cartItems?.addEventListener("click", (event) => {
    const inc = event.target.closest("[data-inc-product]");
    const dec = event.target.closest("[data-dec-product]");
    if (inc) changeCartQty(inc.dataset.incProduct, 1);
    if (dec) changeCartQty(dec.dataset.decProduct, -1);
  });

  document.querySelector("[data-open-cart]")?.addEventListener("click", () => {
    quoteDrawer?.classList.add("open");
    quoteDrawer?.setAttribute("aria-hidden", "false");
  });

  document.querySelector("[data-close-cart]")?.addEventListener("click", () => {
    quoteDrawer?.classList.remove("open");
    quoteDrawer?.setAttribute("aria-hidden", "true");
  });

  document.querySelector("[data-open-wishlist]")?.addEventListener("click", () => {
    wishlistDrawer?.classList.add("open");
    wishlistDrawer?.setAttribute("aria-hidden", "false");
  });

  document.querySelector("[data-close-wishlist]")?.addEventListener("click", () => {
    wishlistDrawer?.classList.remove("open");
    wishlistDrawer?.setAttribute("aria-hidden", "true");
  });

  wishlistItems?.addEventListener("click", async (event) => {
    const removeButton = event.target.closest("[data-remove-wishlist]");
    if (!removeButton) return;
    const sku = decodeProductCode(removeButton.dataset.removeWishlist);
    wishlist = wishlist.filter((item) => String(item.sku || item.model) !== sku);
    persistWishlist();
    updateWishlist();
    renderProducts();
    await syncWishlistItem("DELETE", { sku });
  });

  document.querySelector("[data-wishlist-to-cart]")?.addEventListener("click", wishlistToCart);

  quoteRequestForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const session = getClientSession();

    if (!session?.access_token) {
      setFormStatus(quoteStatus, "Inicia sesion o crea tu cuenta para generar la cotizacion.", "error");
      window.setTimeout(() => {
        window.location.href = "https://extinrod.com/cuenta";
      }, 900);
      return;
    }

    if (!quoteCart.length && !quoteMessage?.value.trim()) {
      setFormStatus(quoteStatus, "Agrega productos o describe que necesitas cotizar.", "error");
      return;
    }

    const submitButton = quoteRequestForm.querySelector("button[type='submit']");
    submitButton.disabled = true;
    setFormStatus(quoteStatus, "Guardando solicitud en CRM...");

    try {
      const response = await fetch("/api/quote-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: quoteCart,
          message: quoteMessage?.value.trim() || "",
        }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFormStatus(quoteStatus, body.error || "No se pudo generar la cotizacion.", "error");
        return;
      }

      quoteCart = [];
      persistCart();
      updateCart();
      if (quoteMessage) quoteMessage.value = "";
      setFormStatus(quoteStatus, "Solicitud enviada. Ya aparece en el CRM para seguimiento.", "ok");
    } catch (error) {
      setFormStatus(quoteStatus, error.message || "No se pudo enviar la solicitud.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });

  renderProducts();
  renderBrandFilter();
  updateCart();
  updateWishlist();
  loadProductsFromApi();
}

clientRegisterForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = clientRegisterForm.querySelector("button[type='submit']");
  submitButton.disabled = true;

  try {
    const formData = new FormData(clientRegisterForm);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/client-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      alert(body.error || "No se pudo crear la cuenta.");
      return;
    }

    alert("Cuenta creada. Ahora inicia sesion para cotizar.");
    clientLoginForm?.querySelector('[name="email"]')?.setAttribute("value", payload.email);
    clientRegisterForm.reset();
  } catch (error) {
    alert(error.message || "No se pudo crear la cuenta.");
  } finally {
    submitButton.disabled = false;
  }
});

clientLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = clientLoginForm.querySelector("button[type='submit']");
  submitButton.disabled = true;

  try {
    const formData = new FormData(clientLoginForm);
    const response = await fetch("/api/client-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      alert(body.error || "No se pudo iniciar sesion.");
      return;
    }

    setClientSession(body);
    clientLoginForm.reset();
    renderClientStatus();
    loadWishlistFromApi();
  } catch (error) {
    alert(error.message || "No se pudo iniciar sesion.");
  } finally {
    submitButton.disabled = false;
  }
});

clientShowRegister?.addEventListener("click", () => {
  if (!clientRegisterPanel) return;
  clientRegisterPanel.open = true;
  clientRegisterPanel.scrollIntoView({ behavior: "smooth", block: "center" });
});

oauthButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const provider = button.dataset.oauthProvider;
    if (provider) startClientOAuth(provider);
  });
});

document.addEventListener("click", (event) => {
  const logoutButton = event.target.closest("[data-client-logout]");
  if (!logoutButton) return;
  clearClientSession();
  renderClientStatus();
  loadWishlistFromApi();
});

handleClientOAuthReturn();
renderClientStatus();

function showSlide(index) {
  if (!slides.length) return;
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === activeSlide);
  });
  document.querySelectorAll(".slider-dot").forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === activeSlide);
  });
}

function scheduleSlider() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => showSlide(activeSlide + 1), 6500);
}

if (slides.length && dotsHost) {
  dotsHost.innerHTML = Array.from(slides)
    .map((_, index) => `<button class="slider-dot ${index === 0 ? "active" : ""}" data-slide-dot="${index}" type="button" aria-label="Ir al slide ${index + 1}"></button>`)
    .join("");

  dotsHost.querySelectorAll(".slider-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.slideDot));
      scheduleSlider();
    });
  });

  nextButton?.addEventListener("click", () => {
    showSlide(activeSlide + 1);
    scheduleSlider();
  });

  prevButton?.addEventListener("click", () => {
    showSlide(activeSlide - 1);
    scheduleSlider();
  });

  scheduleSlider();
}
