import {DiContainer} from "./DiContainer";
import {ParkingLotViewsManager} from "../components/recommender/ParkingLotViewsManager";
import {StallTypeViewsManager} from "../components/recommender/StallTypeViewsManager";
import {RecommendationViewsManager} from "../components/recommender/RecommendationViewsManager";
import {useRecommendation} from "../recommendation/UseRecommendation";
import {createParkingApiClient} from "../integration/parking/sensade/create-parking-api-client";
import {
    AddressAutocompleteService,
    createAddressAutocompleteService
} from "../integration/address/create-address-autocomplete-service";
import {
    createAddressAutocompleteClient
} from "../integration/address/dataforsyningen/create-address-autocomplete-client";
import {
    AutocompleteOptionViewsManager
} from "../components/generic/autocomplete-search-bar/AutocompleteOptionViewsManager";
import {
    AddressViewManager,
    useAddress
} from "../recommendation/UseAddress";
import {createParkingService, ParkingService} from "../integration/parking/create-parking-service";

export function useDefaultDiContainer(): DiContainer {
    return {
        resolveAddressManager(): AutocompleteOptionViewsManager & AddressViewManager {
            return useAddress();
        },
        resolveAddressAutocompleteOptionService(): AddressAutocompleteService {
            return createAddressAutocompleteService(createAddressAutocompleteClient());
        },
        resolveRecommendationManager(): RecommendationViewsManager & ParkingLotViewsManager & StallTypeViewsManager {
            return useRecommendation();
        },
        resolveParkingService(): ParkingService {
            return createParkingService(createParkingApiClient());
        },
    }
}