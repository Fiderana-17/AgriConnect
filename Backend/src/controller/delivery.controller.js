const prisma = require("../config/prisma");

// Include complet réutilisable
const deliveryInclude = {
  reservation: {
    include: {
      listing: {
        select: {
          id: true,
          productName: true,
          unit: true,
          imageUrl: true,
          region: true,
          pricePerUnit: true,
          producerId: true,
        },
      },
      buyer: { select: { id: true, name: true, phone: true } },
    },
  },
  transporter: { select: { id: true, name: true, phone: true } },
};

// ─── GET /api/deliveries ────────────────────────────────────
const getAllDeliveries = async (req, res) => {
  try {
    let where = {};

    if (req.user.role === "transporteur") {
      where = { OR: [{ status: "available" }, { transporterId: req.user.id }] };
    } else if (req.user.role === "acheteur") {
      where = { reservation: { buyerId: req.user.id } };
    } else if (req.user.role === "producteur") {
      where = { reservation: { listing: { producerId: req.user.id } } };
    }
    // admin : pas de filtre → voit tout

    const deliveries = await prisma.delivery.findMany({
      where,
      include: deliveryInclude,
      orderBy: { createdAt: "desc" },
    });

    console.log("ROLE:", req.user.role);
    console.log("WHERE:", JSON.stringify(where));
    console.log("DELIVERIES FOUND:", deliveries.length);
    console.log("DELIVERIES:", JSON.stringify(deliveries, null, 2));

    return res.json(deliveries);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/deliveries/:id ────────────────────────────────
const getDeliveryById = async (req, res) => {
  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: req.params.id },
      include: {
        reservation: {
          include: {
            listing: {
              include: {
                producer: { select: { id: true, name: true, phone: true } },
              },
            },
            buyer: { select: { id: true, name: true, phone: true } },
          },
        },
        transporter: { select: { id: true, name: true, phone: true } },
      },
    });
    if (!delivery) return res.status(404).json({ error: "Livraison introuvable" });
    return res.json(delivery);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── PATCH /api/deliveries/:id/accept ──────────────────────
const acceptDelivery = async (req, res) => {
  try {
    const { fee, dropoff } = req.body;
    if (!fee || Number(fee) <= 0)
      return res.status(400).json({ error: "Un tarif valide (fee) est requis" });

    const delivery = await prisma.delivery.findUnique({ where: { id: req.params.id } });
    if (!delivery)
      return res.status(404).json({ error: "Livraison introuvable" });
    if (delivery.status !== "available")
      return res.status(400).json({ error: "Cette mission n'est plus disponible" });

    await prisma.$transaction([
      prisma.delivery.update({
        where: { id: req.params.id },
        data: {
          transporterId: req.user.id,
          fee:           Number(fee),
          dropoff:       dropoff?.trim() || delivery.dropoff,
          status:        "accepted",
        },
      }),
      prisma.reservation.update({
        where: { id: delivery.reservationId },
        data:  { status: "awaiting_transport" },
      }),
    ]);

    // Recharger avec toutes les relations
    const updated = await prisma.delivery.findUnique({
      where: { id: req.params.id },
      include: deliveryInclude,
    });

    return res.json({ message: "Mission de livraison acceptée", delivery: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── PATCH /api/deliveries/:id/advance ─────────────────────
const advanceDelivery = async (req, res) => {
  try {
    const delivery = await prisma.delivery.findUnique({ where: { id: req.params.id } });
    if (!delivery)
      return res.status(404).json({ error: "Livraison introuvable" });

    if (delivery.transporterId !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ error: "Accès refusé" });

    const transitions = {
      accepted:   "in_transit",
      in_transit: "delivered",
    };
    const nextStatus = transitions[delivery.status];
    if (!nextStatus)
      return res.status(400).json({ error: `Impossible d'avancer depuis : ${delivery.status}` });

    const reservationStatus = nextStatus === "in_transit" ? "in_transit" : "delivered";

    const ops = [
      prisma.delivery.update({ where: { id: req.params.id }, data: { status: nextStatus } }),
      prisma.reservation.update({ where: { id: delivery.reservationId }, data: { status: reservationStatus } }),
    ];

    // Livraison terminée → passer le listing en "delivered"
    if (nextStatus === "delivered") {
      const reservation = await prisma.reservation.findUnique({
        where: { id: delivery.reservationId },
      });
      if (reservation) {
        ops.push(
          prisma.listing.update({
            where: { id: reservation.listingId },
            data:  { status: "delivered" },
          })
        );
      }
    }

    await prisma.$transaction(ops);

    // Recharger avec toutes les relations
    const updated = await prisma.delivery.findUnique({
      where: { id: req.params.id },
      include: deliveryInclude,
    });

    return res.json({ message: `Statut mis à jour : ${nextStatus}`, delivery: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllDeliveries, getDeliveryById, acceptDelivery, advanceDelivery };