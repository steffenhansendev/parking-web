import {AutocompleteSearchOption} from "../../components/AutoCompleteSearchBar";
import {Address} from "../../recommendation/Address";

export interface AddressSearchOption extends AutocompleteSearchOption<Address> {
    type: AddressType;
    id: string;
    entranceAddressId?: string; // Only for type = Address
}

export enum AddressType {
    Street,
    Entrance,
    Address
}