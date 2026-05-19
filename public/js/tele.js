const user = requireAuth();
let pets = [];

async function initTele() {
  if (!user) return;
  await loadPets();
  await loadTeleatendimentos();
}

async function loadPets() {
  const data = await apiFetch("/api/pacientes");
  pets = data.pacientes || [];

  const select = document.getElementById("petSelect");

  if (!pets.length) {
    select.innerHTML = `<option value="">Cadastre um pet primeiro</option>`;
    return;
  }

  select.innerHTML = pets
    .map((pet) => `<option value="${pet.id}">${escapeHtml(pet.nome)} - ${escapeHtml(pet.especie)}</option>`)
    .join("");
}

function openVideoRoom(sala) {
  const roomUrl = `https://meet.jit.si/${encodeURIComponent(sala)}`;
  const videoArea = document.getElementById("videoArea");

  videoArea.innerHTML = `
    <iframe
      src="${roomUrl}"
      allow="camera; microphone; fullscreen; display-capture"
      title="Sala de teleatendimento">
    </iframe>
  `;
}

async function loadTeleatendimentos() {
  const data = await apiFetch("/api/teleatendimentos");
  const teles = data.teleatendimentos || [];
  const list = document.getElementById("teleList");

  if (!teles.length) {
    list.innerHTML = `<div class="empty">Nenhum teleatendimento criado ainda.</div>`;
    return;
  }

  list.innerHTML = teles.map((tele) => `
    <article class="item-card">
      <h3>${escapeHtml(tele.paciente_nome)} • ${escapeHtml(tele.status)}</h3>
      <p>${escapeHtml(tele.descricao || "Sem descrição.")}</p>
      <div class="item-meta">
        <span>${escapeHtml(tele.prioridade_nome || "Sem prioridade")}</span>
        <span>${formatDate(tele.criado_em)}</span>
      </div>
      <button class="btn btn-primary btn-small" onclick="openVideoRoom('${escapeHtml(tele.sala)}')">
        Entrar na sala
      </button>
    </article>
  `).join("");
}

document.getElementById("teleForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const payload = {
    paciente_id: Number(formData.get("paciente_id")),
    descricao: formData.get("descricao")
  };

  try {
    setMessage("teleMessage", "Gerando atendimento...");
    const data = await apiFetch("/api/teleatendimentos", {
      method: "POST",
      body: payload
    });

    const prioridade = data.analise?.prioridade || "definida";
    setMessage("teleMessage", `Sala criada! Prioridade sugerida: ${prioridade}.`);
    openVideoRoom(data.teleatendimento.sala);

    form.reset();
    await loadTeleatendimentos();
  } catch (error) {
    setMessage("teleMessage", error.message, true);
  }
});

initTele().catch((error) => {
  setMessage("teleMessage", error.message, true);
});
