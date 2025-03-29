import {AutocompleteOption} from "./AutocompleteOption";

export interface AutocompleteOptionsManager<T> {
    options: AutocompleteOption<T>[];
    setOptions: (queryValue: string, caretIndexInQueryValue: number) => Promise<void>;
    setMoreSpecificOptions: (option: AutocompleteOption<T>) => Promise<void>;
}