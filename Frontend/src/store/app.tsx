// Backend-connected store.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export type Role = "producteur" | "acheteur" | "transporteur" | "admin";

export type ListingStatus = "active" | "reserved" | "in_transit" | "delivered" | "removed";
export type ReservationStatus = "pending" | "accepted" | "awaiting_transport" | "in_transit" | "delivered";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
}

export interface Listing {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  region: string;
  availableOn: string;
  producerId: string;
  producer: { name: string; id: string };
  imageUrl: string | null;
  description: string | null;
  status: ListingStatus;
  createdAt: string;
}

export interface Reservation {
  id: string;
  listingId: string;
  buyerId: string;
  buyer: { name: string; id: string };
  quantity: number;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
  listing: Listing;
}

export interface Delivery {
  id: string;
  reservationId: string;
  pickup: string;
  dropoff: string;
  fee?: number;
  transporterId?: string;
  transporter?: { name: string; id: string };
  status: "available" | "accepted" | "in_transit" | "delivered";
  reservation: Reservation;
}

const REGIONS = ["Analamanga", "Atsinanana", "Vakinankaratra", "Boeny", "Sava", "Haute_Matsiatra", "Diana"];

interface AppState {
  role: Role | null;
  user: User | null;
  listings: Listing[];
  reservations: Reservation[];
  deliveries: Delivery[];
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  fetchListings: () => Promise<void>;
  addListing: (formData: FormData) => Promise<void>;
  removeListing: (id: string) => Promise<void>;
  reserve: (listingId: string, quantity: number) => Promise<void>;
  acceptDelivery: (deliveryId: string, fee: number) => Promise<void>;
  advanceDelivery: (deliveryId: string) => Promise<void>;
  fetchMyReservations: () => Promise<void>;
  fetchAvailableDeliveries: () => Promise<void>;
  updateReservationStatus: (id: string, status: ReservationStatus) => Promise<void>;
}

const AppCtx = createContext<AppState | null>(null);
export const REGION_LIST = REGIONS;

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(() => (localStorage.getItem("ac_role") as Role) || null);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("ac_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync auth state to localStorage
  useEffect(() => {
    if (role) localStorage.setItem("ac_role", role); else localStorage.removeItem("ac_role");
    if (user) localStorage.setItem("ac_user", JSON.stringify(user)); else localStorage.removeItem("ac_user");
  }, [role, user]);

  const fetchListings = async () => {
    try {
      const { data } = await api.get("/listings");
      setListings(data);
    } catch (error: any) {
      console.error("Error fetching listings:", error);
    }
  };

  const fetchMyReservations = async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/reservations");
      setReservations(data);
    } catch (error: any) {
      console.error("Error fetching reservations:", error);
    }
  };

  const fetchAvailableDeliveries = async () => {
    if (role !== "transporteur") return;
    try {
      const { data } = await api.get("/deliveries");
      setDeliveries(data);
    } catch (error: any) {
      console.error("Error fetching deliveries:", error);
    }
  };

  useEffect(() => {
    fetchListings();
    if (user) {
      fetchMyReservations();
      if (role === "transporteur") fetchAvailableDeliveries();
    }
  }, [user, role]);

  const value = useMemo<AppState>(() => ({
    role, user, listings, reservations, deliveries, loading,
    login: async (email, password) => {
      setLoading(true);
      try {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("ac_token", data.token);
        setUser(data.user);
        setRole(data.user.role);
        toast.success("Connexion réussie");
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Erreur de connexion");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    register: async (payload) => {
      setLoading(true);
      try {
        const { data } = await api.post("/auth/register", payload);
        localStorage.setItem("ac_token", data.token);
        setUser(data.user);
        setRole(data.user.role);
        toast.success("Compte créé avec succès");
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Erreur lors de l'inscription");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    logout: () => {
      localStorage.removeItem("ac_token");
      setUser(null);
      setRole(null);
      setReservations([]);
      setDeliveries([]);
      toast.info("Déconnecté");
    },
    fetchListings,
    fetchMyReservations,
    fetchAvailableDeliveries,
    addListing: async (formData) => {
      try {
        await api.post("/listings", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Annonce publiée !");
        fetchListings();
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Erreur de publication");
      }
    },
    removeListing: async (id) => {
      try {
        await api.delete(`/listings/${id}`);
        toast.info("Annonce retirée");
        fetchListings();
      } catch (error: any) {
        toast.error("Erreur lors de la suppression");
      }
    },
    reserve: async (listingId, quantity) => {
      try {
        await api.post("/reservations", { listingId, quantity });
        toast.success("Réservation effectuée !");
        fetchListings();
        fetchMyReservations();
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Erreur de réservation");
      }
    },
    acceptDelivery: async (deliveryId, fee) => {
      try {
        await api.patch(`/deliveries/${deliveryId}/accept`, { fee });
        toast.success("Livraison acceptée");
        fetchAvailableDeliveries();
      } catch (error: any) {
        toast.error("Erreur d'acceptation");
      }
    },
    advanceDelivery: async (deliveryId) => {
      try {
        await api.patch(`/deliveries/${deliveryId}/advance`);
        toast.success("Statut mis à jour");
        fetchAvailableDeliveries();
      } catch (error: any) {
        toast.error("Erreur de mise à jour");
      }
    },
    updateReservationStatus: async (id, status) => {
      try {
        await api.patch(`/reservations/${id}/status`, { status });
        toast.success(`Réservation ${status === "accepted" ? "acceptée" : "refusée"}`);
        fetchMyReservations();
        fetchListings();
      } catch (error: any) {
        toast.error("Erreur de mise à jour");
      }
    },
  }), [role, user, listings, reservations, deliveries, loading]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp outside AppProvider");
  return ctx;
}

export const formatAr = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " Ar";
