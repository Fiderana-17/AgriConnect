const prisma = require("../config/prisma");

// post /api/reservations
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

// get /api/reservations

// get /api/reservations/{id}

//patch /api/reservation/{id}/status