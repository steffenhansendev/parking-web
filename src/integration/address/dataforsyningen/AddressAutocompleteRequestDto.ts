import {AddressAutocompleteAddressTypeDto} from "./AddressAutocompleteAddressTypeDto";

export interface AddressAutocompleteRequestDto extends Readonly<_AddressAutocompleteRequestDto> {
}

interface _AddressAutocompleteRequestDto {
    value: string;
    caretIndexInValue: number;
    scope?: {
        type?: AddressAutocompleteAddressTypeDto;
        entranceAddressId?: string;
        leastSpecificity?: AddressAutocompleteAddressTypeDto;
        id?: string;
    }
}