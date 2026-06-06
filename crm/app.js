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

const customers = JSON.parse(localStorage.getItem("extinrod_customers") || "null") || seedCustomers;
const followUps = JSON.parse(localStorage.getItem("extinrod_followups") || "null") || seedFollowUps;
const quotes = seedQuotes;
const tasks = seedTasks;

let supabaseClient;
let currentEmployee;

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

async function loadSupabaseConfig() {
  const response = await fetch("/api/config", { headers: { Accept: "application/json" } });
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

async function initializeAuth() {
  setLockedState(false);
  clearDashboard();
  clearAuthError();
  setAuthMessage("Conectando con Supabase...");

  try {
    const config = await withTimeout(loadSupabaseConfig(), 10000, "No se pudo conectar con la configuracion del CRM.");
    if (!config.supabase?.configured) {
      setAuthError("Falta configurar Supabase en Vercel.");
      setAuthMessage("Configuracion incompleta.");
      return;
    }

    if (!window.supabase?.createClient) {
      setAuthError("No se pudo cargar Supabase Auth. Revisa conexion o bloqueadores del navegador.");
      setAuthMessage("Supabase no cargo en el navegador.");
      return;
    }

    supabaseClient = window.supabase.createClient(config.supabase.url, config.supabase.anonKey);
    const { data } = await withTimeout(
      supabaseClient.auth.getSession(),
      10000,
      "No se pudo revisar la sesion actual."
    );

    if (data.session) {
      await loadEmployeeProfile();
      renderAll();
      setLockedState(true);
      setAuthMessage("Acceso autorizado.", "ok");
      return;
    }

    setAuthMessage("Listo. Ingresa tu correo y contrasena.");
  } catch (error) {
    setAuthError(error.message || "No se pudo iniciar Supabase Auth.");
    setAuthMessage("No se pudo preparar el acceso.");
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearAuthError();
  setAuthMessage("Validando acceso...");

  if (!supabaseClient) {
    setAuthError("Supabase aun no esta configurado.");
    setAuthMessage("Acceso no disponible.");
    return;
  }

  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value;
  const submitButton = loginForm.querySelector("button[type='submit']");
  submitButton.disabled = true;

  try {
    const { error } = await withTimeout(
      supabaseClient.auth.signInWithPassword({ email, password }),
      12000,
      "La validacion tardo demasiado. Revisa tu conexion e intenta otra vez."
    );

    if (error) {
      setAuthError(error.message || "Correo o contrasena incorrectos.");
      setAuthMessage("No se pudo iniciar sesion.");
      return;
    }

    await loadEmployeeProfile();
    renderAll();
    loginPassword.value = "";
    setAuthMessage("Acceso autorizado.", "ok");
    setLockedState(true);
  } catch (profileError) {
    await supabaseClient.auth.signOut();
    setAuthError(profileError.message);
    setAuthMessage("El usuario no tiene perfil autorizado.");
  } finally {
    submitButton.disabled = false;
  }
});

logoutButton.addEventListener("click", async () => {
  if (supabaseClient) await supabaseClient.auth.signOut();
  currentEmployee = undefined;
  sessionLabel.textContent = "";
  clearDashboard();
  setLockedState(false);
});

initializeAuth();
