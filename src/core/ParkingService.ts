import {ParkingLot} from "./create-parking-lot";

export interface ParkingService {
    getParkingLots(): Promise<ParkingLot[]>;
}