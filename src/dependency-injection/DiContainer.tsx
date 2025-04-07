import {
    AutocompleteOptionViewsManager
} from "../components/generic/autocomplete-search-bar/AutocompleteOptionViewsManager";
import {RecommendationViewsManager} from "../components/recommender/RecommendationViewsManager";
import {ParkingLotViewsManager} from "../components/recommender/ParkingLotViewsManager";
import {StallTypeViewsManager} from "../components/recommender/StallTypeViewsManager";
import {AddressAutocompleteService} from "../integration/address-autocomplete/create-address-autocomplete-service";
import {ParkingService} from "../integration/parking/create-parking-service";
import {AddressManager} from "../recommendation/UseAddress";

export interface DiContainer {
    // Types are removed at transpilation. Hence, type parameterizing this is not a thing, and
    // a GenericComponent<T> where T = Address may not request this but have some parent, that knows the value of T,
    // do it.
    resolveAddressManager(): AutocompleteOptionViewsManager & AddressManager;

    resolveAddressAutocompleteOptionService(): AddressAutocompleteService;

    resolveRecommendationManager(): RecommendationViewsManager & ParkingLotViewsManager & StallTypeViewsManager;

    resolveParkingService(): ParkingService;
}