const prisma = require("../config/prisma");

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};