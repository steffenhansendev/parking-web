import React, {JSX} from "react";
import "./styles.css";
import {ParkingLotViewsManager} from "./presentation/ParkingLotViewsManager";
import {StallTypeViewsManager} from "./presentation/StallTypeViewsManager";
import {RecommendationViewsManager} from "./presentation/RecommendationViewsManager";
import {useDi} from "./DiProvider";
import {DiContainer} from "./dependency-injection/DiContainer";
import Recommender from "./presentation/Recommender";
import {useRecommendation} from "./application/UseRecommendation";
import {createParkingService} from "./infrastructure/create-parking-service";
import {createParkingApiClient} from "./infrastructure/sensade/create-parking-api-client";

function App(): JSX.Element {
    const recommendationManager: RecommendationViewsManager & ParkingLotViewsManager & StallTypeViewsManager = useRecommendation(createParkingService(createParkingApiClient()));
    return <Recommender recommendationManager={recommendationManager}></Recommender>
}

export default App;