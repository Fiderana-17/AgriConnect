const express = require("express");
const router  = express.Router();

const {
  getAllDeliveries,
  getDeliveryById,
  acceptDelivery,
  advanceDelivery,
} = require("../controller/delivery.controller");

const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.use(authenticate);
router.get("/", getAllDeliveries);
router.get("/:id", getDeliveryById);
router.patch("/:id/accept", authorize("transporteur"), acceptDelivery);
router.patch("/:id/advance", authorize("transporteur", "admin"), advanceDelivery);

module.exports = router;