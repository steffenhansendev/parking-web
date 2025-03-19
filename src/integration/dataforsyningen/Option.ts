import {AutocompleteSearchOption} from "../../components/AutoCompleteSearchBar";
import {Address} from "../../recommendation/Address";

export interface Option extends AutocompleteSearchOption<Address> {
    type: AddressType;
    id: string;
    accessAddressId?: string; // Only for type = Address
}

export enum AddressType {
    Street,
    Entrance,
    Address
}