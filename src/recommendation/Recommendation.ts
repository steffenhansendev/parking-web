import {ParkingLot} from "./Inclusion";

export interface Recommendation {
    parkingLot?: ParkingLot;
    asOf?: Date;
    numberOfAvailableStalls: number
}