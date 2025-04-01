import {DistanceView} from "./DistanceView";

export interface RecommendationView {
    readonly parkingLotId: string,
    readonly parkingLotName: string,
    readonly availableStallCount: number,
    readonly asOf: Date,
    readonly distance?: DistanceView
}