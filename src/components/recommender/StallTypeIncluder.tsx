import {StallTypeView} from "./StallTypeView";
import React, {JSX, useEffect, useState} from "react";
import Checkbox from "../generic/Checkbox";
import {StallTypeViewsManager} from "./StallTypeViewsManager";
import 'bootstrap-icons/font/bootstrap-icons.css';

interface Props {
    manager: StallTypeViewsManager
    isCollapsedAbove: boolean;
}

function StallTypeIncluder({manager, isCollapsedAbove}: Props): JSX.Element {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(isCollapsedAbove);
    useEffect((): void => {
        setIsCollapsed(isCollapsedAbove);
    }, [isCollapsedAbove]);
    return <>
        <div className={"card"}>
            <div className={"card-body"}>
                <div className={"card-title d-flex justify-content-between " + (isCollapsed ? "m-0" : "")}
                     style={{cursor: "pointer"}}
                     onClick={(): void => {
                         setIsCollapsed(!isCollapsed);
                     }}>
                    <h5 className={"m-0"}>{"Stall types included"}</h5>
                    <i className={"bi " + (isCollapsed ? "bi-chevron-down" : "bi-chevron-up" + " fw-bold")}/>
                </div>
                <div className={"collapse " + (isCollapsed ? "collapsed" : "show")}>
                    {manager.stallTypes.map((stallType: StallTypeView, i: number): JSX.Element => {
                        let label: string = stallType.type;
                        label = label.substring(0, 1).toUpperCase() + label.substring(1);
                        return <Checkbox key={stallType.type} label={label}
                                         isChecked={stallType.isChecked}
                                         handleOnChange={(): void => {
                                             manager.toggleStallTypeCheck(i);
                                         }}/>;
                    })}
                </div>
            </div>
        </div>
    </>
}

export default StallTypeIncluder;