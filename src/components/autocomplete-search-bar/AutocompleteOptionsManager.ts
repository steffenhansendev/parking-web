import {AutocompleteOption} from "./AutocompleteOption";

export interface AutocompleteOptionsManager<T> {
    readonly options: AutocompleteOption<T>[];
    readonly setOptions: (queryValue: string, caretIndexInQueryValue: number) => Promise<void>;
    readonly setMoreSpecificOptions: (option: AutocompleteOption<T>) => Promise<void>;
}