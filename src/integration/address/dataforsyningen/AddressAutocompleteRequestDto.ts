import {AddressAutocompleteAddressTypeDto} from "./AddressAutocompleteAddressTypeDto";

export interface AddressAutocompleteRequestDto {
    value: string;
    caretIndexInValue: number;
    scope?: {
        type?: AddressAutocompleteAddressTypeDto;
        entranceAddressId?: string;
        leastSpecificity?: AddressAutocompleteAddressTypeDto;
        id?: string;
    }
}