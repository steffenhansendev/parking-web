import React, {JSX, useEffect, useState} from "react";
import {ParkingLotView} from "./ParkingLotView";
import Checkbox from "../generic/Checkbox";
import {ParkingLotViewsManager} from "./ParkingLotViewsManager";
import 'bootstrap-icons/font/bootstrap-icons.css';

export interface Props {
    manager: ParkingLotViewsManager;
    isCollapsedAbove: boolean;
}

function ParkingLotsIncluder({manager, isCollapsedAbove}: Props): JSX.Element {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(isCollapsedAbove);
    useEffect((): void => {
        setIsCollapsed(isCollapsedAbove)
    }, [isCollapsedAbove]);
    return <>
        <div className={"card"}>
            <div className={"card-body"}>
                <div className={"card-title d-flex justify-content-between " + (isCollapsed ? "m-0" : "")}>
                    <h5>{"Lots included"}</h5>
                    <i className={"bi " + (isCollapsed ? "bi-chevron-down" : "bi-chevron-up" + " fw-bold align-middle")}
                       style={{cursor: "pointer"}}
                       onClick={(): void => {
                           setIsCollapsed(!isCollapsed);
                       }
                       }></i>
                </div>
                <div className={"collapse " + (isCollapsed ? "collapsed" : "show")}>
                    {manager.parkingLots.map((lot: ParkingLotView, i: number): JSX.Element => {
                        let label: string | undefined = lot.name;
                        if (lot.distance) {
                            label += " (" + lot.distance.value.toFixed(0) + " " + lot.distance.unitAbbreviation + ")";
                        }
                        return <Checkbox key={lot.parkingLotId} label={label
                        } isChecked={lot.isChecked} handleOnChange={(): void => {
                            manager.toggleParkingLotCheck(i);
                        }}/>
                    })
                    }
                </div>
            </div>
        </div>

    </>;
}

export default ParkingLotsIncluder;