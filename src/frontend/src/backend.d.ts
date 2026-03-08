import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Reservation {
    id: bigint;
    status: string;
    date: string;
    createdAt: bigint;
    time: string;
    guestName: string;
    partySize: bigint;
    phone: string;
}
export interface MenuItem {
    id: bigint;
    name: string;
    description: string;
    available: boolean;
    category: string;
    price: number;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMenuItem(category: string, name: string, description: string, price: number): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createReservation(guestName: string, date: string, time: string, partySize: bigint, phone: string): Promise<bigint>;
    deleteMenuItem(id: bigint): Promise<void>;
    getAllMenuItems(): Promise<Array<MenuItem>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMenuItems(): Promise<Array<MenuItem>>;
    getMenuItemsByCategory(category: string): Promise<Array<MenuItem>>;
    getReservations(): Promise<{
        reservations: Array<Reservation>;
        completed: Array<Reservation>;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listMenuItems(): Promise<Array<MenuItem>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedMenuItems(): Promise<void>;
    updateMenuItem(id: bigint, category: string, name: string, description: string, price: number, available: boolean): Promise<void>;
    updateReservationStatus(reservationId: bigint, newStatus: string): Promise<[string, bigint]>;
}
