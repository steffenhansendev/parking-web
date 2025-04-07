import React, {JSX} from "react";
import "./styles.css";
import {
    AutocompleteOptionViewsManager
} from "./components/generic/autocomplete-search-bar/AutocompleteOptionViewsManager";
import {ParkingLotViewsManager} from "./components/recommender/ParkingLotViewsManager";
import {StallTypeViewsManager} from "./components/recommender/StallTypeViewsManager";
import {RecommendationViewsManager} from "./components/recommender/RecommendationViewsManager";
import {useDi} from "./dependency-injection/DiProvider";
import {DiContainer} from "./dependency-injection/DiContainer";
import {AddressManager} from "./recommendation/UseAddress";
import Recommender from "./components/recommender/Recommender";

function App(): JSX.Element {
    const diContainer: DiContainer = useDi();
    const addressManager: AutocompleteOptionViewsManager & AddressManager = diContainer.resolveAddressManager();
    const recommendationManager: RecommendationViewsManager & ParkingLotViewsManager & StallTypeViewsManager = diContainer.resolveRecommendationManager();
    addressManager.registerObserver(recommendationManager.addressObserver);
    return <Recommender recommendationManager={recommendationManager} addressManager={addressManager}></Recommender>
}

export default App;