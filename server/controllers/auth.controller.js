import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/use.js"; 
import { transporter } from "../config/mail.js";
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment variables");
}
/* REGISTER */
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
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

  res.status(201).json({ message: "User registered successfully" });
};

/* LOGIN */
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // true in production (https)
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ message: "Login successful" });
};

/* LOGOUT */
export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

/* PROFILE */
export const profile = (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
};
