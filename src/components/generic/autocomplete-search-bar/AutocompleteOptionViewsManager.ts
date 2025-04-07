import {AutocompleteOptionView} from "./AutocompleteOptionView";
import {RefObject} from "react";

export interface AutocompleteOptionViewsManager {
    readonly optionViews: AutocompleteOptionView[];
    readonly autocompleteValue: (queryValue: string, caretIndexInQueryValue: number) => Promise<void>;
    readonly autocompleteOption: (option: AutocompleteOptionView) => Promise<void>;
    readonly commit: () => void;
    readonly staged: AutocompleteOptionView | null;

    unstage(): void;

    stage(option: AutocompleteOptionView): void;
}