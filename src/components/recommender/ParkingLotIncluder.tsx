import React, {JSX} from "react";
import {ParkingLotView} from "./ParkingLotView";
import Checkbox from "../generic/Checkbox";
import {ParkingLotViewsManager} from "./ParkingLotViewsManager";

export interface Props {
    manager: ParkingLotViewsManager
}

function ParkingLotsIncluder({manager}: Props): JSX.Element {
    return <>
        <h5>{"Lots included"}</h5>
        {
            manager.parkingLots.map((lot: ParkingLotView, i: number): JSX.Element => {
                let label: string | undefined = lot.name;
                if (lot.distance) {
                    label += " (" + lot.distance.value.toFixed(0) + " " + lot.distance.unitAbbreviation + ")";
                }
                return <Checkbox key={lot.parkingLotId} label={label
                } isChecked={lot.isChecked} handleOnChange={(): void => {
                    manager.toggleParkingLotCheck(i);
                }}/>
            })
        }</>;
}

export default ParkingLotsIncluder;