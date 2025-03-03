import {StallTypeView} from "./StallTypeView";

export interface StallTypeViewsManager {
    readonly stallTypes: StallTypeView[];
    readonly isGettingStallTypes: boolean;

    toggleStallTypeCheck(i: number): void;
}