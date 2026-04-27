const express = require("express");
const router  = express.Router();

const { register, login, getMe } = require("../controller/auth.controller");
const { authenticate }           = require("../middlewares/auth.middleware");

// POST /api/auth/register — Créer un compte
router.post("/register", register);

// POST /api/auth/login — Se connecter
router.post("/login", login);

// GET /api/auth/me — Profil courant (protégé)
router.get("/me", authenticate, getMe);

module.exports = router;