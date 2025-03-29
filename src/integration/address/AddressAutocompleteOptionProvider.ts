import {AddressAutocompleteOption} from "./AddressAutocompleteOption";

export interface AddressAutocompleteOptionProvider {
    getOptions: (value: string, caretIndexInValue: number) => Promise<AddressAutocompleteOption[]>;
    getMoreSpecificOptions: (option: AddressAutocompleteOption) => Promise<AddressAutocompleteOption[]>;
}