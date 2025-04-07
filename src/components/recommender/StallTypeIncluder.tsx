import {StallTypeView} from "./StallTypeView";
import React, {JSX} from "react";
import Checkbox from "../generic/Checkbox";
import {StallTypeViewsManager} from "./StallTypeViewsManager";
interface Props {
    manager: StallTypeViewsManager
}
function StallTypeIncluder({manager}: Props): JSX.Element {
   return <>
       <h5>{"Stall types included"}</h5>
       {manager.stallTypes.map((stallType: StallTypeView, i: number): JSX.Element => {
           let label: string = stallType.type === "handicap" ? "Disability" : stallType.type;
           label = label.substring(0, 1).toUpperCase() + label.substring(1);
           return <Checkbox key={stallType.type} label={label}
                            isChecked={stallType.isChecked}
                            handleOnChange={(): void => {
                                manager.toggleStallTypeCheck(i);
                            }}/>;
       })}
   </>
}

export default StallTypeIncluder;