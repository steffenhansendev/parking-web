import {AddressAutocompleteOption} from "./AddressAutocompleteOption";

export interface AddressAutocompleteOptionProvider {
    readonly getOptions: (value: string, caretIndexInValue: number) => Promise<AddressAutocompleteOption[]>;
    readonly getMoreSpecificOptions: (option: AddressAutocompleteOption) => Promise<AddressAutocompleteOption[]>;
}