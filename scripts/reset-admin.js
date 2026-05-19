require("dotenv").config();

const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, "..", "medvet_novo.db");

const db = new sqlite3.Database(DB_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function main() {
  await run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      telefone TEXT,
      tipo TEXT NOT NULL CHECK (tipo IN ('cliente', 'adm')),
      crmv TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const email = "admin@medvet.com";
  const senha = "admin123";
  const hash = await bcrypt.hash(senha, 10);
  const existing = await get("SELECT id FROM usuarios WHERE email = ?", [email]);

  if (existing) {
    await run(
      `
      UPDATE usuarios
      SET nome = ?, senha_hash = ?, tipo = 'adm', ativo = 1, crmv = ?
      WHERE email = ?
      `,
      ["Administrador MedVet", hash, "CRMV-SP 00000", email]
    );
  } else {
    await run(
      `
      INSERT INTO usuarios (nome, email, senha_hash, telefone, tipo, crmv)
      VALUES (?, ?, ?, ?, 'adm', ?)
      `,
      ["Administrador MedVet", email, hash, "(11) 99999-9999", "CRMV-SP 00000"]
    );
  }

  console.log("✅ Admin pronto!");
  console.log("E-mail: admin@medvet.com");
  console.log("Senha: admin123");

  db.close();
}

main().catch((error) => {
  console.error("Erro ao resetar admin:", error);
  process.exit(1);
});
