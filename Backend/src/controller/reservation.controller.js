const prisma = require("../config/prisma");

// ─── POST /api/reservations ─────────────────────────────────────────────────
const createReservation = async (req, res) => {
  try {
    const { listingId, quantity } = req.body;

    if (!listingId || !quantity)
      return res.status(400).json({ error: "listingId et quantity sont requis" });

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing)
      return res.status(404).json({ error: "Annonce introuvable" });
    if (listing.status === "removed")
      return res.status(400).json({ error: "Cette annonce n'est plus disponible" });

    // ── Calcul de la quantité déjà réservée ──
    const existingReservations = await prisma.reservation.aggregate({
      where: {
        listingId,
        status: { notIn: ["rejected"] }, // on exclut les refusées
      },
      _sum: { quantity: true },
    });

    const alreadyReserved = existingReservations._sum.quantity || 0;
    const remaining = listing.quantity - alreadyReserved;

    if (Number(quantity) <= 0 || Number(quantity) > remaining)
      return res.status(400).json({ error: `Quantité invalide. Disponible : ${remaining} ${listing.unit}` });

    const newAlreadyReserved = alreadyReserved + Number(quantity);
    const isFull = newAlreadyReserved >= listing.quantity;

    // Transaction : créer réservation + passer listing en "reserved" seulement si stock épuisé
    await prisma.$transaction([
      prisma.reservation.create({
        data: {
          listingId,
          buyerId:    req.user.id,
          quantity:   Number(quantity),
          totalPrice: Number(quantity) * listing.pricePerUnit,
        },
      }),
      // Passer en "reserved" uniquement si le stock est épuisé
      ...(isFull ? [prisma.listing.update({
        where: { id: listingId },
        data: { status: "reserved" },
      })] : []),
    ]);

    const reservation = await prisma.reservation.findFirst({
      where: { listingId, buyerId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { id: true, productName: true, unit: true, region: true, imageUrl: true, pricePerUnit: true } },
        buyer:   { select: { id: true, name: true, phone: true } },
        delivery: true,
      },
    });

    return res.status(201).json({ message: "Réservation envoyée au producteur", reservation });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/reservations ──────────────────────────────────────────────────
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
        listing: {
          select: { id: true, productName: true, unit: true, region: true, imageUrl: true, pricePerUnit: true, producerId: true },
        },
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

// ─── GET /api/reservations/:id ─────────────────────────────────────────────
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

// ─── PATCH /api/reservations/:id/status ────────────────────────────────────
const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const VALID = ["accepted", "rejected", "awaiting_transport", "in_transit", "delivered"];
    if (!VALID.includes(status))
      return res.status(400).json({ error: `Statut invalide. Options : ${VALID.join(", ")}` });

    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: { listing: true },
    });
    if (!reservation) return res.status(404).json({ error: "Réservation introuvable" });

    if (["accepted", "rejected"].includes(status)) {
      if (reservation.listing.producerId !== req.user.id && req.user.role !== "admin")
        return res.status(403).json({ error: "Seul le producteur peut accepter ou refuser" });
    }

    const ops = [
      prisma.reservation.update({ where: { id: req.params.id }, data: { status } }),
    ];

    // Acceptée → créer une livraison disponible
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

    // Refusée → remettre le listing en active (visible et réservable à nouveau)
    if (status === "rejected") {
      ops.push(
        prisma.listing.update({ where: { id: reservation.listingId }, data: { status: "active" } })
      );
    }

    await prisma.$transaction(ops);

    const updated = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: {
        listing:  { select: { id: true, productName: true, unit: true, region: true, imageUrl: true, pricePerUnit: true, producerId: true } },
        buyer:    { select: { id: true, name: true, phone: true } },
        delivery: true,
      },
    });

    return res.json({ message: `Réservation mise à jour : ${status}`, reservation: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── DELETE /api/reservations/:id ──────────────────────────
const deleteReservation = async (req, res) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: { listing: true },
    });

    if (!reservation)
      return res.status(404).json({ error: "Réservation introuvable" });

    // Seul l'acheteur concerné ou un admin peut annuler
    if (reservation.buyerId !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ error: "Accès refusé" });

    // On ne peut annuler que si pas encore en transit ou livré
    if (["in_transit", "delivered"].includes(reservation.status))
      return res.status(400).json({ error: "Impossible d'annuler une réservation en cours de livraison" });

    // Recalcul de la quantité restante après annulation
    const agg = await prisma.reservation.aggregate({
      where: {
        listingId: reservation.listingId,
        status: { notIn: ["rejected"] },
        id: { not: reservation.id }, // exclure celle qu'on supprime
      },
      _sum: { quantity: true },
    });
    const stillReserved = agg._sum.quantity || 0;
    const isFull = stillReserved >= reservation.listing.quantity;

    await prisma.$transaction([
      prisma.reservation.delete({ where: { id: req.params.id } }),
      // Remettre le listing en "active" si le stock n'est plus épuisé
      prisma.listing.update({
        where: { id: reservation.listingId },
        data: { status: isFull ? "reserved" : "active" },
      }),
    ]);

    return res.json({ message: "Réservation annulée" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservationStatus,
  deleteReservation, // ← AJOUTER
};

module.exports = { createReservation, getAllReservations, getReservationById, updateReservationStatus, deleteReservation};