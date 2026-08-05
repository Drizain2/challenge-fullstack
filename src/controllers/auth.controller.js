import { authService } from "../services/auth.service.js";

class AuthController {
  async register(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const newUser = await authService.register(email, password);
      return res.status(201).json({ message: "User created", data: newUser });
    } catch (error) {
      if (error.message === "Email already exists") {
        return res.status(409).json({ message: "Email already exists" });
      }
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const tokens = await authService.login(email, password);
      return res.status(200).json({
        message: "Login successful",
        ...tokens,
      });
    } catch (error) {
      console.error("error login",error);
      return res.status(401).json({ message: "Invalid credentials" });
    }
  }

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
      }

      const accessToken = await authService.refresh(refreshToken);
      return res.json({ accessToken });
    } catch (error) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  }

  async me(req, res) {
    try {
      const user = await authService.me(req.user.id);
      return res.json({ user });
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
}

export const authController = new AuthController();