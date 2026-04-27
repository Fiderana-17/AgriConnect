require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const prisma  = require("./config/prisma");

// ── Routes ────────────────────────────────────────────────
const authRoutes        = require("./routes/auth.route");
const userRoutes        = require("./routes/user.route");
const listingRoutes     = require("./routes/listing.route");
const reservationRoutes = require("./routes/reservation.route");
const deliveryRoutes    = require("./routes/delivery.route");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares globaux ────────────────────────────────────
app.use(cors({
  origin: "http://localhost:5173", // URL du frontend Vite
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dossier d'upload des images produits
app.use("/uploads", express.static("uploads"));

// ── Routes API ─────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/users",        userRoutes);
app.use("/api/listings",     listingRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/deliveries",   deliveryRoutes);

// ── Route de santé ─────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", message: "AgriLink API opérationnelle 🌱", db: "connectée", timestamp: new Date().toISOString() });
  } catch {
    res.status(500).json({ status: "error", message: "Base de données non connectée" });
  }
});

// ── Gestion des routes inconnues ───────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable" });
});

// ── Gestion globale des erreurs ────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur :", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Erreur interne du serveur",
  });
});

// ── Démarrage ──────────────────────────────────────────────
const start = async () => {
  await prisma.$connect();
  console.log("🗄️  Base de données connectée");

  app.listen(PORT, () => {
    console.log(`\n🌿 AgriLink Backend démarré sur http://localhost:${PORT}`);
    console.log(`📋 Environnement : ${process.env.NODE_ENV || "development"}\n`);
  });
};

start().catch((err) => {
  console.error("❌ Impossible de démarrer :", err.message);
  process.exit(1);
});

module.exports = app;