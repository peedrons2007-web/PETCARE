const user = requireAuth();
let especies = [];

if (user?.tipo === "adm") {
  document.getElementById("adminLink")?.classList.remove("hidden");
}

async function initDashboard() {
  if (!user) return;

  document.getElementById("welcomeTitle").textContent = `Olá, ${user.nome.split(" ")[0]}!`;

  await loadEspecies();
  await loadPets();
  await loadRelatos();
}

async function loadEspecies() {
  const data = await apiFetch("/api/especies", { auth: false });
  especies = data.especies || [];

  const select = document.getElementById("especieSelect");
  select.innerHTML = especies
    .map((especie) => `<option value="${especie.id}">${escapeHtml(especie.nome)}</option>`)
    .join("");
}

async function loadPets() {
  const data = await apiFetch("/api/pacientes");
  const pets = data.pacientes || [];
  const list = document.getElementById("petsList");

  if (!pets.length) {
    list.innerHTML = `<div class="empty">Nenhum pet cadastrado ainda. Bora cadastrar o primeiro mascote do esquadrão.</div>`;
    return;
  }

  list.innerHTML = pets.map((pet) => `
    <article class="item-card">
      <h3>${escapeHtml(pet.nome)}</h3>
      <p>${escapeHtml(pet.especie)} ${pet.raca ? `• ${escapeHtml(pet.raca)}` : ""}</p>
      <div class="item-meta">
        ${pet.idade ? `<span>${pet.idade} anos</span>` : ""}
        ${pet.peso ? `<span>${pet.peso} kg</span>` : ""}
        ${pet.sexo ? `<span>${escapeHtml(pet.sexo)}</span>` : ""}
      </div>
    </article>
  `).join("");
}

async function loadRelatos() {
  const data = await apiFetch("/api/relatos");
  const relatos = data.relatos || [];
  const list = document.getElementById("relatosList");

  if (!relatos.length) {
    list.innerHTML = `<div class="empty">Nenhum relato por enquanto.</div>`;
    return;
  }

  list.innerHTML = relatos.map((relato) => `
    <article class="item-card">
      <h3>${escapeHtml(relato.paciente_nome)} • ${escapeHtml(relato.prioridade_nome)}</h3>
      <p>${escapeHtml(relato.descricao)}</p>
      <div class="item-meta">
        <span>Status: ${escapeHtml(relato.status)}</span>
        <span>${formatDate(relato.criado_em)}</span>
      </div>
    </article>
  `).join("");
}

document.getElementById("petForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const payload = {
    nome: formData.get("nome"),
    especie_id: Number(formData.get("especie_id")),
    raca: formData.get("raca"),
    idade: formData.get("idade") ? Number(formData.get("idade")) : null,
    peso: formData.get("peso") ? Number(formData.get("peso")) : null,
    sexo: formData.get("sexo"),
    observacoes: formData.get("observacoes")
  };

  try {
    setMessage("petMessage", "Salvando pet...");
    await apiFetch("/api/pacientes", {
      method: "POST",
      body: payload
    });

    form.reset();
    setMessage("petMessage", "Pet cadastrado com sucesso!");
    await loadPets();
  } catch (error) {
    setMessage("petMessage", error.message, true);
  }
});

initDashboard().catch((error) => {
  setMessage("petMessage", error.message, true);
});
