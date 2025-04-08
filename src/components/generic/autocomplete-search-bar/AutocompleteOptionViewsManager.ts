import {AutocompleteOptionView} from "./AutocompleteOptionView";
import {RefObject} from "react";

export interface AutocompleteOptionViewsManager {
    readonly optionViews: AutocompleteOptionView[];
    readonly autocompleteValue: (queryValue: string, caretIndexInQueryValue: number) => Promise<void>;
    readonly autocompleteOption: (option: AutocompleteOptionView) => Promise<void>;
    readonly stagedOption: AutocompleteOptionView | null;


    stageOption(option: AutocompleteOptionView): void;
    unstageOption(): void;
    commitOption(): void;
}