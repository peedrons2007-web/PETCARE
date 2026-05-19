const form = document.getElementById("cadastroForm");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    senha: formData.get("senha")
  };

  try {
    setMessage("message", "Criando conta...");
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: payload,
      auth: false
    });

    saveSession(data);
    setMessage("message", "Conta criada! Abrindo painel...");
    window.location.href = "./dashboard.html";
  } catch (error) {
    setMessage("message", error.message, true);
  }
});
