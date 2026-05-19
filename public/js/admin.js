const user = requireAuth(["adm"]);

async function initAdmin() {
  if (!user) return;
  await Promise.all([loadStats(), loadRelatos(), loadTeleatendimentos()]);
}

async function loadStats() {
  const data = await apiFetch("/api/admin/resumo");
  const resumo = data.resumo || {};
  const stats = [
    ["Tutores", resumo.tutores || 0],
    ["Pets", resumo.pets || 0],
    ["Relatos", resumo.relatos || 0],
    ["Teleatendimentos", resumo.teleatendimentos || 0],
    ["Pendentes", resumo.pendentes || 0],
    ["Emergências", resumo.emergencias || 0]
  ];

  document.getElementById("statsGrid").innerHTML = stats.map(([label, value]) => `
    <article class="stat-card">
      <strong>${value}</strong>
      <span>${label}</span>
    </article>
  `).join("");
}

function statusOptions(current) {
  const statuses = [
    "pendente",
    "aguardando",
    "aguardando_teleatendimento",
    "em_atendimento",
    "finalizado",
    "cancelado"
  ];

  return statuses.map((status) => `
    <option value="${status}" ${status === current ? "selected" : ""}>
      ${status}
    </option>
  `).join("");
}

async function loadRelatos() {
  const data = await apiFetch("/api/relatos");
  const relatos = data.relatos || [];
  const container = document.getElementById("relatosAdmin");

  if (!relatos.length) {
    container.innerHTML = `<div class="empty">Nenhum relato encontrado.</div>`;
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Pet</th>
          <th>Tutor</th>
          <th>Descrição</th>
          <th>Prioridade</th>
          <th>Status</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        ${relatos.map((relato) => `
          <tr>
            <td>${escapeHtml(relato.paciente_nome)}<br><small>${escapeHtml(relato.especie)}</small></td>
            <td>${escapeHtml(relato.tutor_nome)}<br><small>${escapeHtml(relato.tutor_email)}</small></td>
            <td>${escapeHtml(relato.descricao)}</td>
            <td><span class="badge ${relato.prioridade_nivel >= 3 ? "badge-danger" : "badge-ok"}">${escapeHtml(relato.prioridade_nome)}</span></td>
            <td>
              <select onchange="updateRelato(${relato.id}, this.value)">
                ${statusOptions(relato.status)}
              </select>
            </td>
            <td>${formatDate(relato.criado_em)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

async function loadTeleatendimentos() {
  const data = await apiFetch("/api/teleatendimentos");
  const teles = data.teleatendimentos || [];
  const container = document.getElementById("teleAdmin");

  if (!teles.length) {
    container.innerHTML = `<div class="empty">Nenhum teleatendimento encontrado.</div>`;
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Pet</th>
          <th>Tutor</th>
          <th>Motivo</th>
          <th>Sala</th>
          <th>Status</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        ${teles.map((tele) => `
          <tr>
            <td>${escapeHtml(tele.paciente_nome)}<br><small>${escapeHtml(tele.especie)}</small></td>
            <td>${escapeHtml(tele.tutor_nome)}<br><small>${escapeHtml(tele.tutor_email)}</small></td>
            <td>${escapeHtml(tele.descricao || "-")}</td>
            <td>
              <button class="btn btn-primary btn-small" onclick="window.open('https://meet.jit.si/${escapeHtml(tele.sala)}', '_blank')">
                Abrir sala
              </button>
            </td>
            <td>
              <select onchange="updateTele(${tele.id}, this.value)">
                ${statusOptions(tele.status)}
              </select>
            </td>
            <td>${formatDate(tele.criado_em)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

async function updateRelato(id, status) {
  await apiFetch(`/api/admin/relatos/${id}`, {
    method: "PATCH",
    body: { status }
  });

  await Promise.all([loadStats(), loadRelatos()]);
}

async function updateTele(id, status) {
  await apiFetch(`/api/admin/teleatendimentos/${id}`, {
    method: "PATCH",
    body: { status }
  });

  await Promise.all([loadStats(), loadTeleatendimentos(), loadRelatos()]);
}

document.getElementById("refreshBtn").addEventListener("click", initAdmin);

initAdmin().catch((error) => {
  document.getElementById("statsGrid").innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
});
