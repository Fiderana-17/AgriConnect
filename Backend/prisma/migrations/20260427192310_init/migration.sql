CREATE TYPE "Role" AS ENUM ('producteur', 'acheteur', 'transporteur', 'admin');
CREATE TYPE "ListingStatus" AS ENUM ('active', 'reserved', 'in_transit', 'delivered', 'removed');
CREATE TYPE "ReservationStatus" AS ENUM ('pending', 'accepted', 'rejected', 'awaiting_transport', 'in_transit', 'delivered');
CREATE TYPE "DeliveryStatus" AS ENUM ('available', 'accepted', 'in_transit', 'delivered');
CREATE TYPE "Category" AS ENUM ('Fruits', 'Legumes', 'Cereales', 'Epices', 'Boissons', 'Autres');
CREATE TYPE "Unit" AS ENUM ('kg', 'g', 'L', 'piece', 'sac');
CREATE TYPE "Region" AS ENUM ('Analamanga', 'Atsinanana', 'Vakinankaratra', 'Boeny', 'Sava', 'Haute_Matsiatra', 'Diana');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "Unit" NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "region" "Region" NOT NULL,
    "availableOn" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "producerId" TEXT NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "pickup" TEXT NOT NULL,
    "dropoff" TEXT NOT NULL,
    "fee" DOUBLE PRECISION,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reservationId" TEXT NOT NULL,
    "transporterId" TEXT,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "listings_producerId_idx" ON "listings"("producerId");
CREATE INDEX "listings_status_idx" ON "listings"("status");
CREATE INDEX "listings_region_idx" ON "listings"("region");
CREATE INDEX "listings_category_idx" ON "listings"("category");
CREATE INDEX "reservations_buyerId_idx" ON "reservations"("buyerId");
CREATE INDEX "reservations_listingId_idx" ON "reservations"("listingId");
CREATE INDEX "reservations_status_idx" ON "reservations"("status");
CREATE UNIQUE INDEX "deliveries_reservationId_key" ON "deliveries"("reservationId");
CREATE INDEX "deliveries_transporterId_idx" ON "deliveries"("transporterId");
CREATE INDEX "deliveries_status_idx" ON "deliveries"("status");

ALTER TABLE "listings" ADD CONSTRAINT "listings_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;