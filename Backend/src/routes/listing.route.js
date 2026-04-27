import express from "express"

const router  = express.Router();

const {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
} = require("../controller/listing.controller");

const { authenticate, authorize } = require("../middlewares/auth.middleware");
const upload                      = require("../middlewares/upload.middleware");

router.get("/", getAllListings);

router.get("/:id", getListingById);
router.get("/my/listings", authenticate, authorize("producteur"), getMyListings);
router.post(
  "/",
  authenticate,
  authorize("producteur"),
  upload.single("image"),
  createListing
);

router.put(
  "/:id",
  authenticate,
  authorize("producteur", "admin"),
  upload.single("image"),
  updateListing
);

router.delete("/:id", authenticate, authorize("producteur", "admin"), deleteListing);

module.exports = router;