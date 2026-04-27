const express = require("express");
const router  = express.Router();

const {
    createReservation,
    getAllReservations,
    getReservationById,
    updateReservationStatus
} = require("../controller/reservation.controller")

router.use(authentificate);

router.post("/", authorize("acheteur"), createReservation);

router.get("/", getAllReservations);

router.get("/:id", getReservationById);

router.patch(
  "/:id/status",
  authorize("producteur", "admin", "transporteur"),
  updateReservationStatus
);

module.exports = router;