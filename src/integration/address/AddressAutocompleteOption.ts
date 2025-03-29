import {AutocompleteOption} from "../../components/AutocompleteSearchBar";
import {Address} from "../../recommendation/Address";

import {AddressType} from "./AddressType";

export interface AddressAutocompleteOption extends AutocompleteOption<Address> {
    type: AddressType;
    id: string;
    entranceAddressId?: string; // Only for type = Address
}