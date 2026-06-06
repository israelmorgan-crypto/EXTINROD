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
const logoutButton = document.querySelector("#logoutButton");
const sessionLabel = document.querySelector("#sessionLabel");
const customerRows = document.querySelector("#customerRows");
const followUpList = document.querySelector("#followUpList");
const quoteList = document.querySelector("#quoteList");
const taskList = document.querySelector("#taskList");
const searchInput = document.querySelector("#searchInput");
const dialog = document.querySelector("#followDialog");

function setLockedState(isActive) {
  document.body.classList.toggle("locked", !isActive);
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
  document.body.classList.add("locked");

  try {
    const config = await loadSupabaseConfig();
    if (!config.supabase?.configured) {
      loginError.textContent = "Falta configurar Supabase en Vercel.";
      return;
    }

    if (!window.supabase?.createClient) {
      loginError.textContent = "No se pudo cargar Supabase Auth.";
      return;
    }

    supabaseClient = window.supabase.createClient(config.supabase.url, config.supabase.anonKey);
    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
      await loadEmployeeProfile();
      setLockedState(true);
    }
  } catch (error) {
    loginError.textContent = error.message || "No se pudo iniciar Supabase Auth.";
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";

  if (!supabaseClient) {
    loginError.textContent = "Supabase aun no esta configurado.";
    return;
  }

  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    loginError.textContent = "Correo o contrasena incorrectos.";
    return;
  }

  try {
    await loadEmployeeProfile();
    loginPassword.value = "";
    setLockedState(true);
  } catch (profileError) {
    await supabaseClient.auth.signOut();
    loginError.textContent = profileError.message;
  }
});

logoutButton.addEventListener("click", async () => {
  if (supabaseClient) await supabaseClient.auth.signOut();
  currentEmployee = undefined;
  sessionLabel.textContent = "";
  setLockedState(false);
});

renderAll();
initializeAuth();
