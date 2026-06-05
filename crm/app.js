const seedCustomers = [
  {
    cliente: "Torre Insurgentes",
    contacto: "Laura Mendoza",
    servicio: "Deteccion y alarma",
    estado: "Cotizacion",
    responsable: "Israel",
  },
  {
    cliente: "Colegio del Valle",
    contacto: "Mario Rivas",
    servicio: "Programa interno",
    estado: "Seguimiento",
    responsable: "Guadalupe",
  },
  {
    cliente: "Plaza Reforma",
    contacto: "Ana Torres",
    servicio: "Mantenimiento extintores",
    estado: "Activo",
    responsable: "Carlos",
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
  { tarea: "Registrar visita tecnica", empleado: "Israel", estado: "Pendiente" },
  { tarea: "Actualizar expediente Proteccion Civil", empleado: "Guadalupe", estado: "En proceso" },
  { tarea: "Validar stock de detectores", empleado: "Carlos", estado: "Pendiente" },
];

const authConfig = {
  email: "admin@extinrod.com",
  passwordHash: "4a1d2ade5dd771d8702998e619ca661fd769d57bb783bcee0ecc01bdfb6f0b06",
};

const customers = JSON.parse(localStorage.getItem("extinrod_customers") || "null") || seedCustomers;
const followUps = JSON.parse(localStorage.getItem("extinrod_followups") || "null") || seedFollowUps;
const quotes = seedQuotes;
const tasks = seedTasks;

const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const loginError = document.querySelector("#loginError");
const logoutButton = document.querySelector("#logoutButton");
const customerRows = document.querySelector("#customerRows");
const followUpList = document.querySelector("#followUpList");
const quoteList = document.querySelector("#quoteList");
const taskList = document.querySelector("#taskList");
const searchInput = document.querySelector("#searchInput");
const dialog = document.querySelector("#followDialog");

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function setLockedState() {
  const isActive = sessionStorage.getItem("extinrod_crm_session") === "active";
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

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = loginEmail.value.trim().toLowerCase();
  const passwordHash = await sha256(loginPassword.value);

  if (email === authConfig.email && passwordHash === authConfig.passwordHash) {
    sessionStorage.setItem("extinrod_crm_session", "active");
    loginPassword.value = "";
    loginError.textContent = "";
    setLockedState();
    return;
  }

  loginError.textContent = "Correo o contrasena incorrectos.";
});

logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem("extinrod_crm_session");
  setLockedState();
});

function renderAll() {
  renderCustomers();
  renderMiniCards(followUpList, followUps, (item) => `<strong>${item.cliente}</strong><span>${item.fecha} - ${item.accion}</span>`);
  renderMiniCards(quoteList, quotes, (item) => `<strong>${item.folio} - ${item.cliente}</strong><span>${item.total} - ${item.estado}</span>`);
  renderMiniCards(taskList, tasks, (item) => `<strong>${item.tarea}</strong><span>${item.empleado} - ${item.estado}</span>`);
  updateKpis();
}

setLockedState();
renderAll();
