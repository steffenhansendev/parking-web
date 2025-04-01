import React, {JSX} from "react";
import AutocompleteSearchBar from "../generic/autocomplete-search-bar/AutocompleteSearchBar";
import EllipsisSpinnerSpans from "../generic/EllipsisSpinnerSpans";
import {RecommendationView} from "./RecommendationView";
import Button from "../generic/Button";
import {StallTypeView} from "./StallTypeView";
import Checkbox from "../generic/Checkbox";
import {ParkingLotView} from "./ParkingLotView";
import {RecommendationViewsManager} from "./RecommendationViewsManager";
import {AddressViewManager} from "../../recommendation/UseAddress";
import {AutocompleteOptionViewsManager} from "../generic/autocomplete-search-bar/AutocompleteOptionViewsManager";
import {ParkingLotViewsManager} from "./ParkingLotViewsManager";
import {StallTypeViewsManager} from "./StallTypeViewsManager";

interface Props {
    recommendationManager: RecommendationViewsManager & ParkingLotViewsManager & StallTypeViewsManager;
    addressManager: AddressViewManager & AutocompleteOptionViewsManager;
}

function Recommender({recommendationManager, addressManager}: Props): JSX.Element {
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
                            {
                                recommendationManager.recommendations?.map((recommendation: RecommendationView): JSX.Element => {
                                    if (!(recommendation.availableStallCount > 0)) {
                                        return <h4>{"Currently, there are no available stalls given the criteria."}</h4>
                                    }
                                    let heading: string | undefined = recommendation.parkingLotName;
                                    if (recommendation.distance) {
                                        heading += " (" + recommendation.distance.value.toFixed(0) + " " + recommendation.distance?.unitAbbreviation + ")";
                                    }
                                    return (
                                        <>
                                            <h4>{heading}</h4>
                                            <h5>{`This lot had `}<span
                                                className="fw-bold">{recommendation.availableStallCount}</span>{` available stalls as of ${recommendation.asOf?.toLocaleString("da-DK", {
                                                hour12: false
                                            })}.`}
                                            </h5>
                                        </>
                                    );
                                })
                            }
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
                    : <>
                        <div className="row mt-md-5 my-3">
                            <div className="col-md m-md-0 my-3">
                                <h5>{"Stall types included"}</h5>
                                {recommendationManager.stallTypes.map((stallType: StallTypeView, i: number): JSX.Element => {
                                    let label: string = stallType.type === "handicap" ? "Disability" : stallType.type;
                                    label = label.substring(0, 1).toUpperCase() + label.substring(1);
                                    return <Checkbox key={stallType.type} label={label}
                                                     isChecked={stallType.isChecked}
                                                     handleOnChange={(): void => {
                                                         recommendationManager.toggleStallTypeCheck(i);
                                                     }}/>;
                                })}
                            </div>
                            <div className="col-md m-md-0 my-3">
                                <h5>{"Lots included"}</h5>
                                {recommendationManager.parkingLots.map((lot: ParkingLotView, i: number): JSX.Element => {
                                    let label: string | undefined = lot.name;
                                    if (lot.distance) {
                                        label += " (" + lot.distance.value.toFixed(0) + " " + lot.distance.unitAbbreviation + ")";
                                    }
                                    return <Checkbox key={lot.parkingLotId} label={label
                                    } isChecked={lot.isChecked} handleOnChange={(): void => {
                                        recommendationManager.toggleParkingLotCheck(i);
                                    }}/>
                                })}
                            </div>
                        </div>
                    </>
            }
        </div>
    );
}

export default Recommender;