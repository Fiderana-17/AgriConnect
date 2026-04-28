const prisma          = require("../config/prisma");
const { uploadImage } = require("../config/supabase");
const path            = require("path");

const VALID_CATEGORIES = ["Fruits", "Legumes", "Cereales", "Epices", "Boissons", "Autres"];
const VALID_UNITS      = ["kg", "g", "L", "piece", "sac"];
const VALID_REGIONS    = ["Analamanga", "Atsinanana", "Vakinankaratra", "Boeny", "Sava", "Haute_Matsiatra", "Diana"];

// ─── GET /api/listings ──────────────────────────────────────
const getAllListings = async (req, res) => {
  try {
    const { region, category, q, status } = req.query;
    const where = {
      // On exclut uniquement les annonces "removed"
      // Les annonces "active" ET "reserved" sont visibles par tous
      NOT: { status: "removed" },
      ...(region   && { region }),
      ...(category && { category }),
      // Si un filtre status est explicitement passé en query, on l'applique
      // Sinon on affiche active + reserved
      ...(status
        ? { status }
        : { status: { in: ["active", "reserved"] } }
      ),
      ...(q && {
        OR: [
          { productName: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { producer:    { name: { contains: q, mode: "insensitive" } } },
        ],
      }),
    };
    const listings = await prisma.listing.findMany({
      where,
      include: { producer: { select: { id: true, name: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(listings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/listings/my ───────────────────────────────────
const getMyListings = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { producerId: req.user.id },
      include: { reservations: { select: { id: true, status: true, quantity: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(listings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/listings/:id ──────────────────────────────────
const getListingById = async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: { producer: { select: { id: true, name: true, phone: true } } },
    });
    if (!listing) return res.status(404).json({ error: "Annonce introuvable" });
    return res.json(listing);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/listings ─────────────────────────────────────
const createListing = async (req, res) => {
  try {
    const { productName, category, quantity, unit, pricePerUnit, region, availableOn, description } = req.body;

    if (!productName || !category || !quantity || !unit || !pricePerUnit || !region || !availableOn) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }
    if (!VALID_CATEGORIES.includes(category)) return res.status(400).json({ error: "Catégorie invalide" });
    if (!VALID_UNITS.includes(unit))           return res.status(400).json({ error: "Unité invalide" });
    if (!VALID_REGIONS.includes(region))       return res.status(400).json({ error: "Région invalide" });
    if (Number(quantity) <= 0 || Number(pricePerUnit) <= 0) {
      return res.status(400).json({ error: "La quantité et le prix doivent être positifs" });
    }

    let imageUrl = null;
    if (req.file) {
      const ext      = path.extname(req.file.originalname);
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      imageUrl = await uploadImage(req.file.buffer, filename, req.file.mimetype);
    }

    const listing = await prisma.listing.create({
      data: {
        productName:  productName.trim(),
        category,
        quantity:     Number(quantity),
        unit,
        pricePerUnit: Number(pricePerUnit),
        region,
        availableOn:  new Date(availableOn),
        description:  description?.trim() || null,
        imageUrl,
        producerId:   req.user.id,
      },
      include: { producer: { select: { id: true, name: true } } },
    });

    return res.status(201).json({ message: "Annonce publiée avec succès", listing });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── PUT /api/listings/:id ──────────────────────────────────
const updateListing = async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: "Annonce introuvable" });
    if (listing.producerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const { productName, category, quantity, unit, pricePerUnit, region, availableOn, description } = req.body;

    let imageUrl = undefined;
    if (req.file) {
      const ext      = path.extname(req.file.originalname);
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      imageUrl = await uploadImage(req.file.buffer, filename, req.file.mimetype);
    }

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        ...(productName  && { productName: productName.trim() }),
        ...(category     && { category }),
        ...(quantity     && { quantity: Number(quantity) }),
        ...(unit         && { unit }),
        ...(pricePerUnit && { pricePerUnit: Number(pricePerUnit) }),
        ...(region       && { region }),
        ...(availableOn  && { availableOn: new Date(availableOn) }),
        ...(description  !== undefined && { description }),
        ...(imageUrl     && { imageUrl }),
      },
    });

    return res.json({ message: "Annonce mise à jour", listing: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── DELETE /api/listings/:id (soft delete) ─────────────────
const deleteListing = async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: "Annonce introuvable" });
    if (listing.producerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé" });
    }
    await prisma.listing.update({ where: { id: req.params.id }, data: { status: "removed" } });
    return res.json({ message: "Annonce retirée" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllListings, getMyListings, getListingById, createListing, updateListing, deleteListing };