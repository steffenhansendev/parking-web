import {ParkingLot} from "./create-parking-lot";

export interface Recommendation {
    parkingLot: ParkingLot;
    availability: {
        asOf: Date;
        count: number;
    }
}