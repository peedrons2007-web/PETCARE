const user = requireAuth();

const form = document.getElementById("chatForm");
const input = document.getElementById("chatInput");
const messages = document.getElementById("chatMessages");

function addMessage(type, content, meta = "") {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.innerHTML = `
    <strong>${type === "user" ? "Você" : "MedVet IA"}</strong>
    ${meta ? `<p><span class="badge ${meta.includes("Emergência") || meta.includes("Alta") ? "badge-danger" : "badge-ok"}">${escapeHtml(meta)}</span></p>` : ""}
    <p>${escapeHtml(content)}</p>
  `;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const mensagem = input.value.trim();
  if (!mensagem) return;

  addMessage("user", mensagem);
  input.value = "";

  try {
    const data = await apiFetch("/api/chat/ia", {
      method: "POST",
      body: { mensagem }
    });

    const analise = data.analise;
    addMessage(
      "bot",
      `${analise.resposta}\n\n${analise.aviso}`,
      `Prioridade ${analise.prioridade}`
    );
  } catch (error) {
    addMessage("bot", error.message);
  }
});
