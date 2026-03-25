import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Trip {
    id: bigint;
    destination: string;
    mode: TripMode;
    origin: string;
    distance: bigint;
    roundTrip: boolean;
}
export enum TripMode {
    car = "car",
    bike = "bike",
    walk = "walk",
    transit = "transit"
}
export interface backendInterface {
    deleteTrip(tripId: bigint): Promise<void>;
    getAllTrips(): Promise<Array<Trip>>;
    getTrip(tripId: bigint): Promise<Trip>;
    saveTrip(origin: string, destination: string, mode: TripMode, distance: bigint, roundTrip: boolean): Promise<bigint>;
    updateTrip(tripId: bigint, origin: string, destination: string, mode: TripMode, distance: bigint, roundTrip: boolean): Promise<void>;
}
