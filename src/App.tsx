import React, {JSX, useEffect, useState} from "react";
import "./styles.css";
import Checkbox from "./components/Checkbox";
import Button from "./components/Button";
import {useInclusions} from "./integration/parking/useInclusions";
import {useRecommendations} from "./integration/parking/useRecommendations";
import {Recommendation} from "./recommendation/Recommendation";
import {Inclusion, ParkingLot, StallType} from "./recommendation/Inclusion";
import EllipsisSpinnerSpans from "./components/EllipsisSpinnerSpans";
import geodesic, {GeodesicClass} from "geographiclib-geodesic";
import AutocompleteSearchBar from "./components/autocomplete-search-bar/AutocompleteSearchBar";
import {Address} from "./recommendation/Address";
import {useDi} from "./dependency-injection/DiProvider";
import {AutocompleteOptionsManager} from "./components/autocomplete-search-bar/AutocompleteOptionsManager";

function App(): JSX.Element {
    const addressAutocompleteOptionsManager: AutocompleteOptionsManager<Address> = useDi().resolveAddressAutocompleteOptionsManager();
    const [parkingLotInclusions, setParkingLotInclusions] = useState<ParkingLot[]>([]);
    const [stallTypeInclusions, setStallTypeInclusions] = useState<StallType[]>([]);
    const [isFetchingInclusions, setIsFetchingInclusions] = useState<boolean>(true);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isFetchingRecommendations, setIsFetchingRecommendations] = useState<boolean>(false);
    useInclusions(setParkingLotInclusions, setStallTypeInclusions, setIsFetchingInclusions);
    const recommend: (lots: ParkingLot[], stallTypes: StallType[]) => void = useRecommendations(setRecommendations, setIsFetchingRecommendations);
    const [address, setAddress] = useState<Address>();

    useEffect((): void => {
        const geod: GeodesicClass = geodesic.Geodesic.WGS84;
        const nextParkingLotInclusions: ParkingLot[] = parkingLotInclusions.map((lot: ParkingLot): ParkingLot => {
            if (address) {
                lot.isIncluded = true;
            }
            lot.distanceFromUserInMeters = geod.Inverse(address?.location?.latitude as number, address?.location.longitude as number, lot.location?.latitude as number, lot.location?.longitude as number).s12;
            return lot;
        });
        nextParkingLotInclusions.sort((lotA: ParkingLot, lotB: ParkingLot): number => (lotA.distanceFromUserInMeters ?? 0) - (lotB.distanceFromUserInMeters ?? 0));
        setParkingLotInclusions(nextParkingLotInclusions);
    }, [address, isFetchingInclusions]);

    return (
        <div className="container">
            <div className="row my-3">
                <div className="col justify-content-center text-center">
                    <h1>{"Locate Available Parking at Frederiksbjerg"}</h1>
                </div>
            </div>
            <div className="row my-3">
                <h5>{"Closest to"}</h5>
                <AutocompleteSearchBar<Address> placeholder={"Search for Danish address"}
                                                setResult={setAddress}
                                                isInFocus={true}
                                                optionsManager={addressAutocompleteOptionsManager}/>
            </div>
            {isFetchingRecommendations
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
                                recommendations.map((recommendation: Recommendation): JSX.Element => {
                                    if (!(recommendation.numberOfAvailableStalls > 0)) {
                                        return <h4>{"Currently, there are no available stalls given the criteria."}</h4>
                                    }
                                    let heading: string | undefined = recommendation.parkingLot?.name ?? recommendation.parkingLot?.id;
                                    if (recommendation.parkingLot?.distanceFromUserInMeters) {
                                        heading += " (" + recommendation.parkingLot.distanceFromUserInMeters.toFixed(0) + " m)"
                                    }
                                    return (
                                        <>
                                            <h4>{heading}</h4>
                                            <h5>{`This lot had `}<span
                                                className="fw-bold">{recommendation.numberOfAvailableStalls}</span>{` available stalls as of ${recommendation.asOf?.toLocaleString("da-DK", {
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
                            {parkingLotInclusions.length > 0 &&
                                <Button
                                    title={"Let's park!"}
                                    handleOnClick={(): void => {
                                        recommend(parkingLotInclusions, stallTypeInclusions);
                                    }} classNames={["w-100"]}></Button>}
                        </div>
                    </div>
                </>
            }
            {
                isFetchingInclusions
                    ? <div className="row mt-md-5 my-3">
                        <div className="col-md m-md-0 my-3 justify-content-center text-center">
                            <h5>{"Fetching lots and stall types "}<EllipsisSpinnerSpans/></h5>
                        </div>
                    </div>
                    : <>
                        <div className="row mt-md-5 my-3">
                            <div className="col-md m-md-0 my-3">
                                <h5>{"Stall types included"}</h5>
                                {stallTypeInclusions.map((stallType: StallType, i: number): JSX.Element => {
                                    let label: string = stallType.value === "handicap" ? "Disability" : stallType.value;
                                    label = label.substring(0, 1).toUpperCase() + label.substring(1);
                                    return <Checkbox key={stallType.value} label={label}
                                                     isChecked={stallType.isIncluded}
                                                     handleOnChange={(): void => {
                                                         toggleInclusion<StallType>(i, stallTypeInclusions, setStallTypeInclusions);
                                                     }}/>;
                                })}
                            </div>
                            <div className="col-md m-md-0 my-3">
                                <h5>{"Lots included"}</h5>
                                {parkingLotInclusions.map((lot: ParkingLot, i: number): JSX.Element => {
                                    let label: string | undefined = lot.name;
                                    if (lot.distanceFromUserInMeters) {
                                        label += " (" + lot.distanceFromUserInMeters.toFixed(0) + " m)";
                                    }
                                    return <Checkbox key={lot.id} label={label
                                    } isChecked={lot.isIncluded} handleOnChange={(): void => {
                                        toggleInclusion<ParkingLot>(i, parkingLotInclusions, setParkingLotInclusions);
                                    }}/>
                                })}
                            </div>
                        </div>
                    </>
            }
        </div>
    );
}

function toggleInclusion<T extends Inclusion>(i: number, inclusions: T[], setInclusion: (inclusions: T[]) => void): void {
    setInclusion(inclusions.map((value: T, j: number): T => {
        if (i === j) {
            value.isIncluded = !value.isIncluded;
        }
        return value;
    }))
}

export default App;