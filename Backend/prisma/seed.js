import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seed...");

  await prisma.delivery.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  const [rakoto, marie, jean, admin] = await Promise.all([
    prisma.user.create({ data: { name: "Coop. Toamasina",  email: "coop.toamasina@agrilink.mg",  password, role: "producteur",   phone: "+261 34 00 001 01" } }),
    prisma.user.create({ data: { name: "Marie Acheteur",   email: "marie@agrilink.mg",            password, role: "acheteur",     phone: "+261 33 00 002 02" } }),
    prisma.user.create({ data: { name: "Jean Transporteur",email: "jean@agrilink.mg",             password, role: "transporteur", phone: "+261 32 00 003 03" } }),
    prisma.user.create({ data: { name: "Admin AgriLink",   email: "admin@agrilink.mg",            password, role: "admin" } }),
  ]);

  const [famille, coopAntsirabe, jardin, coopFianar, verger] = await Promise.all([
    prisma.user.create({ data: { name: "Famille Rakoto",   email: "rakoto.sava@agrilink.mg",     password, role: "producteur", phone: "+261 34 00 004 04" } }),
    prisma.user.create({ data: { name: "Coop. Antsirabe",  email: "coop.antsirabe@agrilink.mg",  password, role: "producteur", phone: "+261 34 00 005 05" } }),
    prisma.user.create({ data: { name: "Jardin de Mahitsy",email: "mahitsy@agrilink.mg",         password, role: "producteur", phone: "+261 34 00 006 06" } }),
    prisma.user.create({ data: { name: "Coop. Fianar",     email: "coop.fianar@agrilink.mg",     password, role: "producteur", phone: "+261 34 00 007 07" } }),
    prisma.user.create({ data: { name: "Verger Majunga",   email: "verger.majunga@agrilink.mg",  password, role: "producteur", phone: "+261 34 00 008 08" } }),
  ]);

  await prisma.listing.createMany({
    data: [
      {
        productName:  "Litchis frais",
        category:     "Fruits",
        quantity:     800,
        unit:         "kg",
        pricePerUnit: 2500,
        region:       "Atsinanana",
        availableOn:  new Date("2026-05-04"),
        description:  "Litchis cueillis à la main, prêts pour livraison à Tamatave et Antananarivo.",
        status:       "active",
        producerId:   rakoto.id,
      },
      {
        productName:  "Vanille Bourbon",
        category:     "Epices",
        quantity:     35,
        unit:         "kg",
        pricePerUnit: 380000,
        region:       "Sava",
        availableOn:  new Date("2026-05-10"),
        description:  "Gousses de vanille noire, séchées 6 mois. Qualité export.",
        status:       "active",
        producerId:   famille.id,
      },
      {
        productName:  "Riz rouge bio",
        category:     "Cereales",
        quantity:     1200,
        unit:         "kg",
        pricePerUnit: 3200,
        region:       "Vakinankaratra",
        availableOn:  new Date("2026-05-02"),
        description:  "Riz rouge cultivé sur les hautes terres, sans pesticides.",
        status:       "active",
        producerId:   coopAntsirabe.id,
      },
      {
        productName:  "Tomates fraîches",
        category:     "Legumes",
        quantity:     450,
        unit:         "kg",
        pricePerUnit: 1800,
        region:       "Analamanga",
        availableOn:  new Date("2026-04-30"),
        description:  "Tomates mûries au soleil, livraison express possible.",
        status:       "active",
        producerId:   jardin.id,
      },
      {
        productName:  "Café Arabica",
        category:     "Boissons",
        quantity:     200,
        unit:         "kg",
        pricePerUnit: 18000,
        region:       "Haute_Matsiatra",
        availableOn:  new Date("2026-05-15"),
        description:  "Grains d'altitude, torréfaction artisanale au choix.",
        status:       "active",
        producerId:   coopFianar.id,
      },
      {
        productName:  "Mangues Kent",
        category:     "Fruits",
        quantity:     600,
        unit:         "kg",
        pricePerUnit: 2200,
        region:       "Boeny",
        availableOn:  new Date("2026-05-06"),
        description:  "Mangues juteuses calibre 400-600g, palette de 600 kg.",
        status:       "active",
        producerId:   verger.id,
      },
    ],
  });

  console.log("✅ Seed terminé avec succès !");
  console.log("\n📧 Comptes créés (mot de passe : password123) :");
  console.log("   producteur  → coop.toamasina@agrilink.mg");
  console.log("   acheteur    → marie@agrilink.mg");
  console.log("   transporteur→ jean@agrilink.mg");
  console.log("   admin       → admin@agrilink.mg");
}

main()
  .catch((e) => { console.error("❌ Erreur seed :", e); process.exit(1); })
  .finally(() => prisma.$disconnect());