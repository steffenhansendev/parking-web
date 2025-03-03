import {RecommendationView} from "./RecommendationView";
import {Address} from "dawa-autocomplete-react";

export interface RecommendationViewsManager {
    readonly recommendations: RecommendationView[] | null;
    readonly isRecommending: boolean;

    recommendParkingLot(): Promise<void>;

    addressObserver(address: Address | null): void;
}