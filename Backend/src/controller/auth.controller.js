const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const prisma  = require("../config/prisma");

// ─── Génération du token JWT ────────────────────────────────
const generateToken = (user) =>
  jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// ─── POST /api/auth/register ────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Champs requis : name, email, password, role" });
    }

    const validRoles = ["producteur", "acheteur", "transporteur", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Rôle invalide. Options : ${validRoles.join(", ")}` });
    }

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (exists) return res.status(409).json({ error: "Cet email est déjà utilisé" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase().trim(), password: hashed, role, phone: phone || null },
    });

    return res.status(201).json({
      message: "Compte créé avec succès",
      token: generateToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/auth/login ───────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis" });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    return res.json({
      message: "Connexion réussie",
      token: generateToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/auth/me ───────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, getMe };