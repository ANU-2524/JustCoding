import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; 
import { transporter } from "../config/mail.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET is required in production environment");
}
/* REGISTER */
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // 👉 Greeting Mail
  await transporter.sendMail({
    from: `"MyApp 🚀" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Welcome to MyApp 🎉",
    html: `
      <h2>Hello ${name} 👋</h2>
      <p>Welcome to MyApp. Your account is successfully created.</p>
      <p>Happy coding 💻</p>
    `,
  });

  res.status(201).json({ registered: true, userId: user._id });
};

/* LOGIN */
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production (https)
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
};

/* LOGOUT */
export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ loggedOut: true });
};

/* PROFILE */
export const profile = (req, res) => {
  res.json(req.user);
};
