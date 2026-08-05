import sqlite3 from "sqlite3";
import { open } from "sqlite";

let db =null;

export async function initDB() {
  db = await open({
    filename: "./db.sqlite", 
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);
  return db;
}

// Fonction pour récupérer l'instance de la BD dans vos contrôleurs
export function getDB() {
  if (!db) {
    throw new Error("La base de données n'est pas encore initialisée !");
  }
  return db;
}

class UserRepository {
  async findByEmail(email) {
    return await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
  }

  async create( {email, password }) {
    const result = await db.run(
      `INSERT INTO users (email, password) VALUES (?, ?)`,
      [email, password]
    );
    return { id: result.lastID, email };
  }

  async findById(id) {
    return await db.get(`SELECT id, email FROM users WHERE id = ?`, [id]);
  }
}

export const userRepository = new UserRepository();