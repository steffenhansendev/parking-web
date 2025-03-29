import React, {JSX} from "react";

import {AutocompleteOption} from "./AutocompleteOption";

const ACTIVE_LI_ELEMENT_CLASS: string = "active";
const MOUSE_OVER_LI_ELEMENT_CLASS: string = "bg-dark-subtle";
const UL_ELEMENT_STYLE: React.CSSProperties = {width: "100%", cursor: "default", display: "block"}

interface Props<T> {
    options: AutocompleteOption<T>[];
    activeLiElementIndex: number,
    choose: (option: AutocompleteOption<T>) => Promise<void>;
}

function AutocompleteSearchBarDropdown<T>({options, activeLiElementIndex, choose}: Props<T>): JSX.Element {
    return (
        <ul
            // Rather than a list of <Option> elements, <li> and <ul> were chosen because:
            // Using <Option> will cause the dropdown to never show again whenever an option is chosen.
            // Using <Option> offers no way of distinguishing whether an option was chosen or the <Input>'s value was changed.
            className={"dropdown-menu"}
            style={UL_ELEMENT_STYLE}>
            {options.map((option: AutocompleteOption<T>, i: number) => {
                return <li
                    className={activeLiElementIndex === i ? `dropdown-item ${ACTIVE_LI_ELEMENT_CLASS}` : "dropdown-item"}
                    onMouseOver={(e): void => {
                        e.currentTarget.classList.add(MOUSE_OVER_LI_ELEMENT_CLASS);
                    }}
                    onMouseOut={(e): void => {
                        e.currentTarget.classList.remove(MOUSE_OVER_LI_ELEMENT_CLASS);
                    }}
                    onMouseDown={async () => {
                        await choose(option);
                    }}
                    key={option.queryValue}
                >
                    {option.viewValue}
                </li>;
            })}
        </ul>
    );
}

export default AutocompleteSearchBarDropdown;