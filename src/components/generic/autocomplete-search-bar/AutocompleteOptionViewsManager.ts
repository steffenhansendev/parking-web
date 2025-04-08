import {AutocompleteOptionView, AutocompleteQuery} from "./AutocompleteOptionView";

export interface AutocompleteOptionViewsManager {
    readonly optionViews: AutocompleteOptionView[];
    readonly autocompleteQuery: (query: AutocompleteQuery) => Promise<void>;
    readonly autocompleteOption: (option: AutocompleteOptionView) => Promise<void>;
    readonly stagedOption: AutocompleteOptionView | null;

    stageOption(option: AutocompleteOptionView): void;

    unstageOption(): void;

    commitOption(): void;
}