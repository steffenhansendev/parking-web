import {DiContainer} from "./DiContainer";
import {ParkingLotViewsManager} from "../components/recommender/ParkingLotViewsManager";
import {StallTypeViewsManager} from "../components/recommender/StallTypeViewsManager";
import {RecommendationViewsManager} from "../components/recommender/RecommendationViewsManager";
import {useRecommendation} from "../recommendation/UseRecommendation";
import {createParkingApiClient} from "../integration/parking/sensade/create-parking-api-client";
import {
    AutocompleteAddressService,
    createAutocompleteAddressService
} from "../integration/autocomplete-address/create-autocomplete-address-service";
import {
    createAutocompleteAddressApiClient
} from "../integration/autocomplete-address/dataforsyningen/create-autocomplete-address-api-client";
import {
    AutocompleteOptionViewsManager
} from "../components/generic/autocomplete-search-bar/AutocompleteOptionViewsManager";
import {
    AddressManager,
    useAddress
} from "../recommendation/UseAddress";
import {createParkingService, ParkingService} from "../integration/parking/create-parking-service";

export function useDefaultDiContainer(): DiContainer {
    return {
        resolveAddressManager(): AutocompleteOptionViewsManager & AddressManager {
            return useAddress();
        },
        resolveAddressAutocompleteOptionService(): AutocompleteAddressService {
            return createAutocompleteAddressService(createAutocompleteAddressApiClient());
        },
        resolveRecommendationManager(): RecommendationViewsManager & ParkingLotViewsManager & StallTypeViewsManager {
            return useRecommendation();
        },
        resolveParkingService(): ParkingService {
            return createParkingService(createParkingApiClient());
        },
    }
}