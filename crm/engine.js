const seedCustomers = [
  {
    cliente: "Torre Insurgentes",
    contacto: "Laura Mendoza",
    servicio: "Deteccion y alarma",
    estado: "Cotizacion",
    responsable: "G. Rodriguez",
  },
  {
    cliente: "Colegio del Valle",
    contacto: "Mario Rivas",
    servicio: "Programa interno",
    estado: "Seguimiento",
    responsable: "A. Rodriguez",
  },
  {
    cliente: "Plaza Reforma",
    contacto: "Ana Torres",
    servicio: "Mantenimiento extintores",
    estado: "Activo",
    responsable: "Taller",
  },
];

const seedFollowUps = [
  { cliente: "Torre Insurgentes", accion: "Enviar propuesta actualizada", fecha: "Hoy" },
  { cliente: "Colegio del Valle", accion: "Confirmar fecha de simulacro", fecha: "Manana" },
  { cliente: "Plaza Reforma", accion: "Programar servicio trimestral", fecha: "Viernes" },
];

const seedQuotes = [
  { folio: "EXT-001", cliente: "Torre Insurgentes", total: "$128,500", estado: "En revision" },
  { folio: "EXT-002", cliente: "Plaza Reforma", total: "$36,900", estado: "Enviada" },
];

const seedTasks = [
  { tarea: "Registrar visita tecnica", empleado: "Israel Morgan", estado: "Pendiente" },
  { tarea: "Actualizar expediente Proteccion Civil", empleado: "A. Rodriguez", estado: "En proceso" },
  { tarea: "Validar stock de detectores", empleado: "Taller", estado: "Pendiente" },
];

function readStoredArray(key, fallback) {
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return [...fallback];

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [...fallback];
  } catch {
    localStorage.removeItem(key);
    return [...fallback];
  }
}

const customers = readStoredArray("extinrod_customers", seedCustomers);
const followUps = readStoredArray("extinrod_followups", seedFollowUps);
const quotes = seedQuotes;
const tasks = seedTasks;

let supabaseClient;
let currentEmployee;
const apiBaseUrl = window.location.protocol === "file:" ? "https://extinrod.mx" : "";

const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const loginError = document.querySelector("#loginError");
const authStatus = document.querySelector("#authStatus");
const loginScreen = document.querySelector("#loginScreen");
const logoutButton = document.querySelector("#logoutButton");
const sessionLabel = document.querySelector("#sessionLabel");
const privateSections = document.querySelectorAll("[data-private]");
const customerRows = document.querySelector("#customerRows");
const followUpList = document.querySelector("#followUpList");
const quoteList = document.querySelector("#quoteList");
const taskList = document.querySelector("#taskList");
const searchInput = document.querySelector("#searchInput");
const dialog = document.querySelector("#followDialog");

window.extinrodCrmReady = true;

window.addEventListener("error", (event) => {
  setAuthError(`Error de carga del CRM: ${event.message}`);
  setAuthMessage("No se pudo preparar el acceso.");
});

window.addEventListener("unhandledrejection", (event) => {
  setAuthError(`Error de conexion del CRM: ${event.reason?.message || event.reason || "respuesta no disponible"}`);
  setAuthMessage("No se pudo completar la accion.");
});

function setLockedState(isActive) {
  document.body.classList.toggle("locked", !isActive);
  loginScreen.hidden = isActive;
  privateSections.forEach((section) => {
    section.hidden = !isActive;
  });
}

function setAuthMessage(message, state = "info") {
  authStatus.textContent = message;
  authStatus.classList.toggle("ok", state === "ok");
}

function setAuthError(message) {
  loginError.textContent = message;
}

function clearAuthError() {
  loginError.textContent = "";
}

function withTimeout(promise, ms, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(script);
  });
}

async function ensureSupabaseLibrary() {
  if (window.supabase?.createClient) return;

  const sources = [
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
    "https://unpkg.com/@supabase/supabase-js@2",
  ];

  for (const source of sources) {
    try {
      setAuthMessage("Cargando Supabase Auth...");
      await withTimeout(loadScript(source), 8000, "La carga de Supabase Auth tardo demasiado.");
      if (window.supabase?.createClient) return;
    } catch {
      // Try the next CDN.
    }
  }

  throw new Error("No se pudo cargar Supabase Auth. Prueba en Chrome sin bloqueadores o revisa tu conexion.");
}

function clearDashboard() {
  customerRows.innerHTML = "";
  followUpList.innerHTML = "";
  quoteList.innerHTML = "";
  taskList.innerHTML = "";
  document.querySelector("#kpiClientes").textContent = "0";
  document.querySelector("#kpiSeguimientos").textContent = "0";
  document.querySelector("#kpiCotizaciones").textContent = "0";
  document.querySelector("#kpiVencidas").textContent = "0";
}

function renderCustomers(items = customers) {
  customerRows.innerHTML = items
    .map(
      (item) => `
        <tr>
          <td><strong>${item.cliente}</strong></td>
          <td>${item.contacto}</td>
          <td>${item.servicio}</td>
          <td><span class="pill ${item.estado === "Activo" ? "green" : ""}">${item.estado}</span></td>
          <td>${item.responsable}</td>
        </tr>
      `
    )
    .join("");
}

function renderMiniCards(host, items, template) {
  host.innerHTML = items.map((item) => `<article class="mini-card">${template(item)}</article>`).join("");
}

function updateKpis() {
  document.querySelector("#kpiClientes").textContent = customers.length;
  document.querySelector("#kpiSeguimientos").textContent = followUps.length;
  document.querySelector("#kpiCotizaciones").textContent = quotes.length;
  document.querySelector("#kpiVencidas").textContent = "1";
}

function persist() {
  localStorage.setItem("extinrod_customers", JSON.stringify(customers));
  localStorage.setItem("extinrod_followups", JSON.stringify(followUps));
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  renderCustomers(
    customers.filter((item) =>
      `${item.cliente} ${item.contacto} ${item.servicio} ${item.estado} ${item.responsable}`.toLowerCase().includes(query)
    )
  );
});

document.querySelector("[data-open-form]").addEventListener("click", () => dialog.showModal());
document.querySelector("[data-close-form]").addEventListener("click", () => dialog.close());

dialog.addEventListener("submit", () => {
  const cliente = document.querySelector("#formCliente").value.trim();
  const contacto = document.querySelector("#formContacto").value.trim();
  const servicio = document.querySelector("#formServicio").value.trim();
  const accion = document.querySelector("#formAccion").value.trim();

  customers.unshift({ cliente, contacto, servicio, estado: "Seguimiento", responsable: "Sin asignar" });
  followUps.unshift({ cliente, accion, fecha: "Nuevo" });
  persist();
  renderAll();
  dialog.close();
});

function renderAll() {
  renderCustomers();
  renderMiniCards(followUpList, followUps, (item) => `<strong>${item.cliente}</strong><span>${item.fecha} - ${item.accion}</span>`);
  renderMiniCards(quoteList, quotes, (item) => `<strong>${item.folio} - ${item.cliente}</strong><span>${item.total} - ${item.estado}</span>`);
  renderMiniCards(taskList, tasks, (item) => `<strong>${item.tarea}</strong><span>${item.empleado} - ${item.estado}</span>`);
  updateKpis();
}

function mergeWebQuoteRequests(requests = []) {
  requests.forEach((request) => {
    const company = request.company_name || request.contact_name || request.email || "Prospecto web";
    const service = (request.quote_request_items || []).length
      ? request.quote_request_items.map((item) => `${item.qty} x ${item.sku}`).join(", ")
      : request.message || "Solicitud web";

    if (!customers.some((item) => item.cliente === company && item.contacto === request.email)) {
      customers.unshift({
        cliente: company,
        contacto: request.email || request.contact_name || "Sin correo",
        servicio: service,
        estado: request.status === "nuevo" ? "Prospecto" : request.status,
        responsable: "Sin asignar",
      });
    }

    if (!quotes.some((item) => item.folio === `WEB-${String(request.id).slice(0, 8)}`)) {
      quotes.unshift({
        folio: `WEB-${String(request.id).slice(0, 8)}`,
        cliente: company,
        total: "Por cotizar",
        estado: request.status || "nuevo",
      });
    }
  });
}

async function loadWebProspects(employeeEmail) {
  if (!employeeEmail) return;
  const response = await fetch(`${apiBaseUrl}/api/crm-data?employee=${encodeURIComponent(employeeEmail)}`, {
    headers: { Accept: "application/json" },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "No se pudieron cargar prospectos web.");
  mergeWebQuoteRequests(body.quote_requests || []);
}

async function loadSupabaseConfig() {
  const response = await fetch(`${apiBaseUrl}/api/config`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("No se pudo leer la configuracion.");
  return response.json();
}

async function loadEmployeeProfile() {
  const { data, error } = await supabaseClient.from("current_employee").select("*").maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Este correo no esta autorizado en el CRM.");
  currentEmployee = data;
  sessionLabel.textContent = `${data.full_name} - ${data.role}`;
}

async function linkEmployeeProfile() {
  const { data } = await supabaseClient.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("No se encontro una sesion activa.");

  const response = await fetch(`${apiBaseUrl}/api/link-employee`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error || "No se pudo vincular el usuario con el CRM.");
  }
}

async function loadAuthorizedEmployee() {
  try {
    await loadEmployeeProfile();
  } catch (error) {
    await linkEmployeeProfile();
    await loadEmployeeProfile();
  }
}

function friendlyAuthError(error) {
  const message = (error?.message || "").toLowerCase();
  if (message.includes("invalid login credentials")) {
    return "Correo o contrasena incorrectos. Revisa que el usuario exista en Supabase Auth.";
  }
  if (message.includes("email not confirmed")) {
    return "El correo existe, pero falta confirmarlo en Supabase Auth o desactivar la confirmacion por correo.";
  }
  if (message.includes("too many")) {
    return "Hubo demasiados intentos. Espera unos minutos e intenta de nuevo.";
  }
  return error?.message || "No se pudo iniciar sesion.";
}

async function initializeAuth() {
  setLockedState(false);
  clearDashboard();
  clearAuthError();
  setAuthMessage("Listo. Ingresa tu correo y contrasena.");

  try {
    const savedEmployee = JSON.parse(sessionStorage.getItem("extinrod_crm_employee") || "null");
    if (savedEmployee?.email) {
      currentEmployee = savedEmployee;
      sessionLabel.textContent = `${savedEmployee.full_name} - ${savedEmployee.role}`;
      await loadWebProspects(savedEmployee.email);
      renderAll();
      setLockedState(true);
      setAuthMessage("Acceso autorizado.", "ok");
      return;
    }
  } catch (error) {
    sessionStorage.removeItem("extinrod_crm_employee");
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearAuthError();
  setAuthMessage("Validando acceso...");

  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value;
  const submitButton = loginForm.querySelector("button[type='submit']");
  submitButton.disabled = true;

  try {
    const response = await withTimeout(
      fetch(`${apiBaseUrl}/api/crm-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      }),
      12000,
      "La validacion tardo demasiado. Revisa tu conexion e intenta otra vez."
    );
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setAuthError(body.error || "Correo o contrasena incorrectos.");
      setAuthMessage("No se pudo iniciar sesion.");
      return;
    }

    currentEmployee = body.employee;
    sessionStorage.setItem("extinrod_crm_employee", JSON.stringify(body.employee));
    sessionLabel.textContent = `${body.employee.full_name} - ${body.employee.role}`;
    await loadWebProspects(body.employee.email);
    renderAll();
    loginPassword.value = "";
    setAuthMessage("Acceso autorizado.", "ok");
    setLockedState(true);
  } catch (error) {
    setAuthError(error.message || "No se pudo validar el acceso.");
    setAuthMessage("Error de conexion.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Entrar al CRM";
  }
});

logoutButton.addEventListener("click", async () => {
  sessionStorage.removeItem("extinrod_crm_employee");
  currentEmployee = undefined;
  sessionLabel.textContent = "";
  clearDashboard();
  setLockedState(false);
});

initializeAuth();
