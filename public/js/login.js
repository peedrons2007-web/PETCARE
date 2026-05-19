const form = document.getElementById("loginForm");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    email: formData.get("email"),
    senha: formData.get("senha")
  };

  try {
    setMessage("message", "Entrando...");
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: payload,
      auth: false
    });

    saveSession(data);
    setMessage("message", "Login realizado com sucesso!");

    window.location.href = data.usuario.tipo === "adm" ? "./admin.html" : "./dashboard.html";
  } catch (error) {
    setMessage("message", error.message, true);
  }
});
