import {AutocompleteOptionsManager} from "../components/autocomplete-search-bar/AutocompleteOptionsManager";
import {Address} from "../recommendation/Address";
import {AddressAutocompleteOptionProvider} from "../integration/address/AddressAutocompleteOptionProvider";
import {AddressAutocompleteApiClient} from "../integration/address/dataforsyningen/AddressAutocompleteApiClient";
import {ParkingApiClient} from "../integration/parking/sensade/ParkingApiClient";

export interface DiContainer {
    // Types are removed at transpilation. Hence, type parameterizing this is not a thing, and
    // a GenericComponent<T> where T = Address may not request this but have some parent, that knows the value of T,
    // do it.
    resolveAddressAutocompleteOptionsManager(): AutocompleteOptionsManager<Address>;

    resolveAddressAutocompleteOptionProvider(): AddressAutocompleteOptionProvider;

    resolveAddressAutocompleteApiClient(): AddressAutocompleteApiClient;

    resolveParkingApiClient(): ParkingApiClient;
}