import {ParkingLot} from "./Inclusion";

export interface Recommendation {
    readonly parkingLot: ParkingLot;
    readonly asOf: Date;
    readonly numberOfAvailableStalls: number;
}