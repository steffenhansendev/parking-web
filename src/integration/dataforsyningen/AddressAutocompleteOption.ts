import {AutocompleteOption} from "../../components/AutocompleteSearchBar";
import {Address} from "../../recommendation/Address";

export interface AddressAutocompleteOption extends AutocompleteOption<Address> {
    type: AddressType;
    id: string;
    entranceAddressId?: string; // Only for type = Address
}

export enum AddressType {
    Street,
    Entrance,
    Address
}