import {AutocompleteOptionView} from "./AutocompleteOptionView";
import {RefObject} from "react";

export interface AutocompleteOptionViewsManager {
    readonly optionViews: AutocompleteOptionView[];
    readonly queryOptionViews: (queryValue: string, caretIndexInQueryValue: number) => Promise<void>;
    readonly specifyOptionViews: (option: AutocompleteOptionView) => Promise<void>;
    readonly stagedOptionView: RefObject<AutocompleteOptionView | undefined>;
    readonly commitChoice: () => Promise<void>;
}