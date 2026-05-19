const API_BASE = "";

function getToken() {
  return localStorage.getItem("medvet_token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("medvet_user"));
  } catch {
    return null;
  }
}

function saveSession({ token, usuario }) {
  localStorage.setItem("medvet_token", token);
  localStorage.setItem("medvet_user", JSON.stringify(usuario));
}

function logout() {
  localStorage.removeItem("medvet_token");
  localStorage.removeItem("medvet_user");
  window.location.href = "./login.html";
}

async function apiFetch(path, options = {}) {
  const {
    method = "GET",
    body = null,
    auth = true
  } = options;

  const headers = {
    "Content-Type": "application/json"
  };

  const token = getToken();

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.erro || "Erro inesperado.");
  }

  return data;
}

function requireAuth(allowedTypes = []) {
  const user = getUser();
  const token = getToken();

  if (!user || !token) {
    window.location.href = "./login.html";
    return null;
  }

  if (allowedTypes.length && !allowedTypes.includes(user.tipo)) {
    window.location.href = user.tipo === "adm" ? "./admin.html" : "./dashboard.html";
    return null;
  }

  const adminLink = document.getElementById("adminLink");
  if (adminLink && user.tipo === "adm") {
    adminLink.classList.remove("hidden");
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  return user;
}

function setMessage(elementId, text, isError = false) {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.textContent = text || "";
  el.classList.toggle("error", Boolean(isError));
}

function formatDate(dateString) {
  if (!dateString) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(String(dateString).replace(" ", "T")));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
