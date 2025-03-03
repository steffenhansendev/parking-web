import {DistanceView} from "./DistanceView";

export interface ParkingLotView {
    readonly parkingLotId: string,
    readonly isChecked: boolean,
    readonly name: string,
    readonly distance?: DistanceView,
}