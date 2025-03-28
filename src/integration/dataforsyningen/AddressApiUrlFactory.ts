import {AddressType} from "./AddressAutocompleteSearchOption";

export interface AddressApiUrlFactory {
    getAutocompleteUrl: (query: AutocompleteQuery) => URL;
}

export interface AutocompleteQuery {
    value: string;
    caretIndexInValue: number;
    scope?: {
        type?: AddressType;
        entranceAddressId?: string;
        leastSpecificity?: AddressType;
        id?: string;
    }
}