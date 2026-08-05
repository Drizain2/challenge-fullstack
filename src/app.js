import dotenv from "dotenv";
import express from "express";
import { authController } from "./controllers/auth.controller.js";
import { initDB } from "./repositories/user.repository.js";
import { isAuthenticated } from "./middlewares/auth.middleware.js";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

async function startServer() {
  try {
    await initDB(); // Crée la base de données et la table si absentes
    console.log("Base de données initialisée avec succès.");

    app.post("/register", (req, res) => authController.register(req, res));
    app.post("/login", (req, res) => authController.login(req, res));
    app.post("/refresh", (req, res) => authController.refresh(req, res));
    app.get("/me", isAuthenticated, (req, res) => authController.me(req, res));

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Erreur lors du démarrage du serveur :", err);
  }
}

startServer();
