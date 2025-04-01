import {RecommendationView} from "./RecommendationView";
import {Address} from "../../recommendation/Address";

export interface RecommendationViewsManager {
    readonly recommendations: RecommendationView[] | null;
    readonly isRecommending: boolean;

    recommendParkingLot(): Promise<void>;

    addressObserver(address: Address | null): void;
}