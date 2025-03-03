import {ParkingLotView} from "./ParkingLotView";

export interface ParkingLotViewsManager {
    readonly parkingLots: ParkingLotView[];
    readonly isGettingParkingLots: boolean;

    toggleParkingLotCheck(i: number): void;
}