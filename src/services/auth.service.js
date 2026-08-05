import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository.js";

class AuthService {
  async register(email, password) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await this.hashPassword(password);
    return await userRepository.create({
      email,
      password: hashedPassword,
    });
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    console.log(user, password);
    if (!user || !(await this.verifyPassword(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    const payload = {
      id: user.id,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, process.env.jwt_secret, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(payload, process.env.refresh_secret, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken) {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.refresh_secret
      );

      const newPayload = {
        id: payload.id,
        email: payload.email,
      };

      return jwt.sign(newPayload, process.env.jwt_secret, {
        expiresIn: "15m",
      });
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

async me(id) {
  const user = await userRepository.findById(id);
  if (!user) throw new Error("User not found");

  // On enlève le password avant de renvoyer
  const { password, ...safeUser } = user;
  return safeUser;
}

  async hashPassword(password, saltRounds = 10) {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }

  async verifyPassword(plainPassword, storedHash) {
    console.log(plainPassword, storedHash);
    return await bcrypt.compare(plainPassword, storedHash);
  }
}

export const authService = new AuthService();