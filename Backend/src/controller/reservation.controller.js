const prisma = require("../config/prisma");

// ─── POST /api/reservations ─────────────────────────────────
const createReservation = async (req, res) => {
  try {
    const { listingId, quantity } = req.body;

    if (!listingId || !quantity) return res.status(400).json({ error: "listingId et quantity sont requis" });

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing)                    return res.status(404).json({ error: "Annonce introuvable" });
    if (listing.status !== "active") return res.status(400).json({ error: "Cette annonce n'est plus disponible" });
    if (Number(quantity) <= 0 || Number(quantity) > listing.quantity) {
      return res.status(400).json({ error: `Quantité invalide. Max disponible : ${listing.quantity} ${listing.unit}` });
    }

    const [reservation] = await prisma.$transaction([
      prisma.reservation.create({
        data: {
          listingId,
          buyerId:    req.user.id,
          quantity:   Number(quantity),
          totalPrice: Number(quantity) * listing.pricePerUnit,
        },
        include: {
          listing: { select: { productName: true, unit: true, pricePerUnit: true } },
          buyer:   { select: { id: true, name: true } },
        },
      }),
      prisma.listing.update({ where: { id: listingId }, data: { status: "reserved" } }),
    ]);

    return res.status(201).json({ message: "Réservation envoyée au producteur", reservation });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/reservations ──────────────────────────────────
const getAllReservations = async (req, res) => {
  try {
    let where = {};

    if (req.user.role === "acheteur") {
      where = { buyerId: req.user.id };
    } else if (req.user.role === "producteur") {
      where = { listing: { producerId: req.user.id } };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        listing: { select: { id: true, productName: true, unit: true, region: true, imageUrl: true } },
        buyer:   { select: { id: true, name: true, phone: true } },
        delivery: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(reservations);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/reservations/:id ──────────────────────────────
const getReservationById = async (req, res) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: {
        listing:  { include: { producer: { select: { id: true, name: true, phone: true } } } },
        buyer:    { select: { id: true, name: true, phone: true } },
        delivery: { include: { transporter: { select: { id: true, name: true, phone: true } } } },
      },
    });
    if (!reservation) return res.status(404).json({ error: "Réservation introuvable" });
    return res.json(reservation);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── PATCH /api/reservations/:id/status ─────────────────────
const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const VALID = ["accepted", "rejected", "awaiting_transport", "in_transit", "delivered"];
    if (!VALID.includes(status)) return res.status(400).json({ error: `Statut invalide. Options : ${VALID.join(", ")}` });

    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: { listing: true },
    });
    if (!reservation) return res.status(404).json({ error: "Réservation introuvable" });

    if (["accepted", "rejected"].includes(status)) {
      if (reservation.listing.producerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Seul le producteur peut accepter ou refuser" });
      }
    }

    const ops = [
      prisma.reservation.update({ where: { id: req.params.id }, data: { status } }),
    ];

    if (status === "accepted") {
      ops.push(
        prisma.delivery.create({
          data: {
            reservationId: reservation.id,
            pickup:        reservation.listing.region,
            dropoff:       "À définir",
          },
        })
      );
    }

    if (status === "rejected") {
      ops.push(
        prisma.listing.update({ where: { id: reservation.listingId }, data: { status: "active" } })
      );
    }

    const [updated] = await prisma.$transaction(ops);

    return res.json({ message: `Réservation mise à jour : ${status}`, reservation: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { createReservation, getAllReservations, getReservationById, updateReservationStatus };