# AgriConnect Mada 🇲🇬

AgriConnect Mada est une marketplace agricole moderne reliant les producteurs, les acheteurs et les transporteurs à Madagascar.

## 🚀 Structure du Projet

- `/agri-connect-mada` : Frontend (React + Vite + TailwindCSS + Shadcn/UI)
- `/backend` : API REST (Node.js + Express + Prisma + PostgreSQL)

---

## 🛠️ Installation

### 1. Prérequis
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (recommandé) ou npm
- [PostgreSQL](https://www.postgresql.org/)

### 2. Backend
```bash
cd backend
pnpm install
```

#### Configuration du Backend
Créez un fichier `.env` dans le dossier `backend` :
```env
PORT=5000
DATABASE_URL="postgresql://utilisateur:motdepasse@localhost:5432/agricole_db"
JWT_SECRET=votre_secret_ici
JWT_EXPIRES_IN=7d
```

#### Base de données (Prisma)
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Frontend
```bash
cd agri-connect-mada
pnpm install
```

#### Configuration du Frontend
Créez un fichier `.env` dans le dossier `agri-connect-mada` :
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Lancement

### Lancer le Backend
```bash
cd backend
pnpm run dev
```
L'API sera disponible sur `http://localhost:5000`.

### Lancer le Frontend
```bash
cd agri-connect-mada
pnpm run dev
```
L'application sera disponible sur `http://localhost:5173`.

---

## 🏗️ Fonctionnalités implémentées

- **Authentification** : Inscription/Connexion avec rôles (Producteur, Acheteur, Transporteur, Admin).
- **Gestion des annonces** : Publication de récoltes avec photos, prix et quantités.
- **Réservations** : Système de commande entre acheteur et producteur.
- **Logistique** : Gestion des livraisons pour les transporteurs.
- **Design Premium** : Interface responsive, mode sombre/clair, animations fluides.

---

## 👥 Rôles utilisateur

1. **Producteur** : Publie ses récoltes, gère ses stocks et accepte/refuse les réservations.
2. **Acheteur** : Parcourt le catalogue, réserve des produits et suit ses commandes.
3. **Transporteur** : Voit les missions de livraison disponibles, propose un tarif et gère le transit.
4. **Admin** : Modère le contenu et suit l'activité globale.
