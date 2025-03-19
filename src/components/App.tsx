import React, {JSX, useState} from "react";
import "../styles.css";
import Checkbox from "./Checkbox";
import Button from "./Button";
import {useInclusions} from "../integration/useInclusions";
import {useRecommendations} from "../integration/useRecommendations";
import {parkingApiUrlFactory} from "../integration/parking-api-url-factory";
import {ParkingApiUrlFactory} from "../integration/ParkingApiUrlFactory";
import {Recommendation} from "../recommendation/Recommendation";
import {Inclusion, ParkingLot, StallType} from "../recommendation/Inclusion";
import EllipsisSpinnerSpans from "./EllipsisSpinnerSpans";

const apiUrlFactory: ParkingApiUrlFactory = parkingApiUrlFactory();

function App(): JSX.Element {
    const [parkingLotInclusions, setParkingLotInclusions] = useState<ParkingLot[]>([]);
    const [stallTypeInclusions, setStallTypeInclusions] = useState<StallType[]>([]);
    const [isFetchingInclusions, setIsFetchingInclusions] = useState<boolean>(true);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isFetchingRecommendations, setIsFetchingRecommendations] = useState<boolean>(false);
    useInclusions(setParkingLotInclusions, setStallTypeInclusions, setIsFetchingInclusions, apiUrlFactory);
    const recommend: (lots: ParkingLot[], stallTypes: StallType[]) => void = useRecommendations(setRecommendations, setIsFetchingRecommendations, apiUrlFactory);

    return (
        <div className="container">
            <div className="row m-3">
                <div className="col justify-content-center text-center">
                    <h1>{"Parking at Frederiksbjerg"}</h1>
                </div>
            </div>
            {
                isFetchingInclusions
                    ? <div className="row m-3">
                        <div className="col justify-content-center text-center">
                            <h5>{"Fetching metadata "}<EllipsisSpinnerSpans/></h5>
                        </div>
                    </div>
                    : <>
                        <div className="row m-3">
                            <div className="col-md m-md-0 m-3">
                                <h4>{"Lots included"}</h4>
                                {parkingLotInclusions.map((lot: ParkingLot, i: number): JSX.Element => {
                                    return <Checkbox key={lot.id} label={lot.name} isChecked={lot.isIncluded}
                                                     handleOnChange={(): void => {
                                                         toggleInclusion<ParkingLot>(i, parkingLotInclusions, setParkingLotInclusions);
                                                     }}/>;
                                })}
                            </div>
                            <div className="col-md m-md-0 m-3">
                                <h4>{"Stall types included"}</h4>
                                {stallTypeInclusions.map((stallType: StallType, i: number): JSX.Element => {
                                    return <Checkbox key={stallType.value} label={stallType.value}
                                                     isChecked={stallType.isIncluded}
                                                     handleOnChange={(): void => {
                                                         toggleInclusion<StallType>(i, stallTypeInclusions, setStallTypeInclusions);
                                                     }}/>;
                                })}
                            </div>
                        </div>
                        {isFetchingRecommendations
                            ?
                            <div className="row m-3">
                                <div className="col justify-content-center text-center">
                                    <h5>{"Fetching recommendation "}<EllipsisSpinnerSpans/></h5>
                                </div>
                            </div>
                            : <>
                                <div className="row m-3">
                                    <div className="col justify-content-center text-center">
                                        <Button
                                            title={"Recommend lot of maximum availability now!"}
                                            handleOnClick={(): void => {
                                                recommend(parkingLotInclusions, stallTypeInclusions);
                                            }}></Button>
                                    </div>
                                </div>
                                <div className="row m-5">
                                    <div className="col justify-content-center text-center">
                                        {
                                            recommendations.map((recommendation: Recommendation): JSX.Element => {
                                                if (!(recommendation.numberOfAvailableStalls > 0)) {
                                                    return <h4>{"Currently, there are no available stalls given the criteria."}</h4>
                                                }
                                                return (
                                                    <>
                                                        <h2>{recommendation.parkingLot?.name ?? recommendation.parkingLot?.id}</h2>
                                                        <h4>{`This lot had `}<span
                                                            className="fw-bold">{recommendation.numberOfAvailableStalls}</span>{` available stalls as of ${recommendation.asOf?.toString()}.`}
                                                        </h4>
                                                    </>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            </>
                        }
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