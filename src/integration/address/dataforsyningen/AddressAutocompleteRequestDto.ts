import {AddressAutocompleteEntityTypeDto} from "./AddressAutocompleteTypeDto";

export interface AddressAutocompleteRequestDto extends Readonly<_AddressAutocompleteRequestDto> {
}

interface _AddressAutocompleteRequestDto {
    value: string;
    caretIndexInValue: number;
    scope?: {
        type?: AddressAutocompleteEntityTypeDto;
        entranceAddressId?: string;
        leastSpecificity?: AddressAutocompleteEntityTypeDto;
        id?: string;
    }
}