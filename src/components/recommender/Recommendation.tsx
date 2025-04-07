import {RecommendationView} from "./RecommendationView";
import React, {JSX} from "react";

interface Props {
    recommendations?: RecommendationView[]
}

function Recommendation({recommendations}: Props): JSX.Element {
    return <>
        {
            recommendations?.map((recommendation: RecommendationView): JSX.Element => {
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
    </>
}

export default Recommendation;