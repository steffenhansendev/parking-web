import {DiContainer} from "./DiContainer";
import {
    createAddressAutocompleteOptionsManager
} from "../integration/address/create-address-autocomplete-options-manager";
import {
    createAddressAutocompleteClient
} from "../integration/address/dataforsyningen/create-address-autocomplete-client";
import {
    createAddressAutocompleteOptionProvider
} from "../integration/address/create-address-autocomplete-option-provider";
import {AddressAutocompleteApiClient} from "../integration/address/dataforsyningen/AddressAutocompleteApiClient";
import {AddressAutocompleteOptionProvider} from "../integration/address/AddressAutocompleteOptionProvider";
import {AutocompleteOptionsManager} from "../components/autocomplete-search-bar/AutocompleteOptionsManager";
import {Address} from "../recommendation/Address";

export function createDiContainer(): DiContainer {
    return {
        resolveAddressAutocompleteClient(): AddressAutocompleteApiClient {
            return createAddressAutocompleteClient();
        }, resolveAddressAutocompleteOptionProvider(): AddressAutocompleteOptionProvider {
            return createAddressAutocompleteOptionProvider();
        }, resolveAddressAutocompleteOptionsManager(): AutocompleteOptionsManager<Address> {
            return createAddressAutocompleteOptionsManager();
        }
    }
}