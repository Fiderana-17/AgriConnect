const express = require("express");
const router  = express.Router();

const { getAllUsers, getUserById, updateUser, deleteUser } = require("../controller/user.controller");
const { authenticate, authorize }                          = require("../middlewares/auth.middleware");

// Toutes les routes utilisateur nécessitent une authentification
router.use(authenticate);

// GET /api/users — Liste de tous les utilisateurs (admin seulement)
router.get("/", authorize("admin"), getAllUsers);

// GET /api/users/:id — Profil d'un utilisateur
router.get("/:id", getUserById);

// PUT /api/users/:id — Modifier son profil
router.put("/:id", updateUser);

// DELETE /api/users/:id — Supprimer un compte (admin seulement)
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;