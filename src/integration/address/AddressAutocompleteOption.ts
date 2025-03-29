import {Address} from "../../recommendation/Address";

import {AddressType} from "./AddressType";
import {AutocompleteOption} from "../../components/autocomplete-search-bar/AutocompleteOption";

export interface AddressAutocompleteOption extends AutocompleteOption<Address> {
    type: AddressType;
    id: string;
    entranceAddressId?: string; // Only for type = Address
}