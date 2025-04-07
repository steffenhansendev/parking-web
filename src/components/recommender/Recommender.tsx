import React, {JSX} from "react";
import AutocompleteSearchBar from "../generic/autocomplete-search-bar/AutocompleteSearchBar";
import EllipsisSpinnerSpans from "../generic/EllipsisSpinnerSpans";
import Button from "../generic/Button";
import {RecommendationViewsManager} from "./RecommendationViewsManager";
import {AutocompleteOptionViewsManager} from "../generic/autocomplete-search-bar/AutocompleteOptionViewsManager";
import {ParkingLotViewsManager} from "./ParkingLotViewsManager";
import {StallTypeViewsManager} from "./StallTypeViewsManager";
import ParkingLotIncluder from "./ParkingLotIncluder";
import StallTypeIncluder from "./StallTypeIncluder";
import Recommendation from "./Recommendation";

interface Props {
    recommendationManager: RecommendationViewsManager & ParkingLotViewsManager & StallTypeViewsManager;
    addressManager: AutocompleteOptionViewsManager;
}

function Recommender({recommendationManager, addressManager}: Props): JSX.Element {
    const isCollapsed: boolean = (recommendationManager.recommendations?.length ?? 0) > 0;
    return (
        <div className="container">
            <div className="row my-3">
                <div className="col justify-content-center text-center">
                    <h1>{"Locate Available Parking at Frederiksbjerg"}</h1>
                </div>
            </div>
            <div className="row my-3">
                <h5>{"Closest to"}</h5>
                <AutocompleteSearchBar placeholder={"Search for Danish address"}
                                       isInFocus={true}
                                       optionsManager={addressManager}/>
            </div>
            {recommendationManager.isRecommending
                ?
                <div className="row my-3">
                    <div className="col justify-content-center text-center">
                        <h5>{"Fetching recommendation "}<EllipsisSpinnerSpans/></h5>
                    </div>
                </div>
                : <>
                    <div className="row my-3">
                        <div className="col justify-content-center text-center">
                            <Recommendation recommendations={recommendationManager.recommendations ?? undefined}/>
                        </div>
                    </div>
                    <div className="row my-3">
                        <div className="col justify-content-center text-center">
                            {recommendationManager.parkingLots.length > 0 &&
                                <Button
                                    title={"Let's park!"}
                                    handleOnClick={async (): Promise<void> => {
                                        await recommendationManager.recommendParkingLot();
                                    }} classNames={["w-100"]}></Button>}
                        </div>
                    </div>
                </>
            }
            {
                recommendationManager.isGettingParkingLots
                    ? <div className="row mt-md-5 my-3">
                        <div className="col-md m-md-0 my-3 justify-content-center text-center">
                            <h5>{"Fetching lots and stall types "}<EllipsisSpinnerSpans/></h5>
                        </div>
                    </div>
                    : !recommendationManager.isRecommending &&
                    <>
                        <div className="row mt-md-5 my-3">
                            <div className="col-md m-md-0 my-3">
                                <StallTypeIncluder manager={recommendationManager}
                                                   isCollapsedAbove={isCollapsed}/>
                            </div>
                            <div className="col-md m-md-0 my-3">
                                <ParkingLotIncluder manager={recommendationManager}
                                                    isCollapsedAbove={isCollapsed}/>
                            </div>
                        </div>
                    </>
            }
        </div>
    );
}


export default Recommender;