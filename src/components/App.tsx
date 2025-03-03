import React, {JSX, useState} from "react";
import "../styles.css";
import Checkbox from "./Checkbox";
import Button from "./Button";
import {useInclusions} from "../integration/useInclusions";
import {useRecommendations} from "../integration/useRecommendations";
import styles from "../styles.module.css";
import {parkingApiUrlFactory} from "../integration/parking-api-url-factory";
import {ParkingApiUrlFactory} from "../integration/ParkingApiUrlFactory";
import {Recommendation} from "../recommendation/Recommendation";
import {Inclusion, ParkingLot, StallType} from "../recommendation/Inclusion";

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
        <div className={styles.flexColumn}>
            <div className={styles.flexRow}>
                <h1 className={styles.flexGrow}>{"Parking at Frederiksbjerg"}</h1>
            </div>
            {
                isFetchingInclusions
                    ? <div className={styles.flexRow}><h2>{"Fetching metadata ..."}</h2></div>
                    : <>
                        <div className={styles.flexRow}>
                            <div>
                                <h3>{"Lots included"}</h3>
                                {parkingLotInclusions.map((lot: ParkingLot, i: number): JSX.Element => {
                                    return <Checkbox key={lot.id} label={lot.name} isChecked={lot.isIncluded}
                                                     handleOnChange={(): void => {
                                                         toggleInclusion<ParkingLot>(i, parkingLotInclusions, setParkingLotInclusions);
                                                     }}/>;
                                })}
                            </div>
                            <div>
                                <h3>{"Stall types included"}</h3>
                                {stallTypeInclusions.map((stallType: StallType, i: number): JSX.Element => {
                                    return <Checkbox key={stallType.value} label={stallType.value}
                                                     isChecked={stallType.isIncluded}
                                                     handleOnChange={(): void => {
                                                         toggleInclusion<StallType>(i, stallTypeInclusions, setStallTypeInclusions);
                                                     }}/>;
                                })}
                            </div>
                        </div>
                        <div className={styles.flexColumn}>{
                            isFetchingRecommendations
                                ? <div className={styles.flexRow}><h3>{"Fetching recommendation ..."}</h3></div>
                                : <div className={styles.flexColumn}>
                                    <div className={styles.flexRow}><Button
                                        title={"Recommend lot of maximum availability now!"}
                                        handleOnClick={(): void => {
                                            recommend(parkingLotInclusions, stallTypeInclusions);
                                        }}></Button></div>
                                    {
                                        <div className={styles.flexRow}>{
                                            recommendations.map((recommendation: Recommendation): JSX.Element => {
                                                if (!(recommendation.numberOfAvailableStalls > 0)) {
                                                    return <h3>{"Currently, there are no available stalls given the criteria."}</h3>
                                                }
                                                return <div>
                                                    <h3>{recommendation.parkingLot?.name ?? recommendation.parkingLot?.id}</h3>
                                                    <h4>{`This lot had ${recommendation.numberOfAvailableStalls} available stalls as of ${recommendation.asOf?.toString()}.`}</h4>
                                                </div>
                                            })
                                        }</div>
                                    }</div>
                        }
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