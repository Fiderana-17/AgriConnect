const express = require("express");
const router  = express.Router();

const {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservationStatus,
  deleteReservation
} = require("../controller/reservation.controller");

const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/", getAllReservations);

router.get("/:id", getReservationById);

router.post("/", authorize("acheteur"), createReservation);

router.patch(
  "/:id/status",
  authorize("producteur", "admin", "transporteur"),
  updateReservationStatus
);

router.delete("/:id", authorize("acheteur", "admin"), deleteReservation); 

module.exports = router;