import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MenuItem, Reservation } from "../backend.d";
import { useActor } from "./useActor";

// ─── Menu Queries ────────────────────────────────────────────────────────────

export function useGetMenuItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menuItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMenuItemsByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menuItems", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuItemsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllMenuItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["allMenuItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      category,
      name,
      description,
      price,
    }: {
      category: string;
      name: string;
      description: string;
      price: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addMenuItem(category, name, description, price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      queryClient.invalidateQueries({ queryKey: ["allMenuItems"] });
    },
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      category,
      name,
      description,
      price,
      available,
    }: {
      id: bigint;
      category: string;
      name: string;
      description: string;
      price: number;
      available: boolean;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateMenuItem(
        id,
        category,
        name,
        description,
        price,
        available,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      queryClient.invalidateQueries({ queryKey: ["allMenuItems"] });
    },
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteMenuItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      queryClient.invalidateQueries({ queryKey: ["allMenuItems"] });
    },
  });
}

// ─── Reservation Queries ──────────────────────────────────────────────────────

export function useCreateReservation() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      guestName,
      date,
      time,
      partySize,
      phone,
    }: {
      guestName: string;
      date: string;
      time: string;
      partySize: bigint;
      phone: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createReservation(guestName, date, time, partySize, phone);
    },
  });
}

export function useGetReservations() {
  const { actor, isFetching } = useActor();
  return useQuery<{ reservations: Reservation[]; completed: Reservation[] }>({
    queryKey: ["reservations"],
    queryFn: async () => {
      if (!actor) return { reservations: [], completed: [] };
      return actor.getReservations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateReservationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reservationId,
      newStatus,
    }: {
      reservationId: bigint;
      newStatus: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateReservationStatus(reservationId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSeedMenuItems() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.seedMenuItems();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      queryClient.invalidateQueries({ queryKey: ["allMenuItems"] });
    },
  });
}
