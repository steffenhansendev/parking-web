import React, {JSX} from "react";
import {AutocompleteOptionView} from "./AutocompleteOptionView";

const LI_ELEMENT_CLASS_NAMES: string[] = ["dropdown-item", "autocomplete-option-item"];
const ACTIVE_LI_ELEMENT_CLASS_NAMES: string[] = ["active"];
const MOUSE_OVER_LI_ELEMENT_CLASS_NAMES: string[] = ["bg-dark-subtle"];

const UL_ELEMENT_CLASS_NAMES: string[] = ["dropdown-menu", "autocomplete-option-list"];
const UL_ELEMENT_STYLE: React.CSSProperties = {width: "100%", cursor: "default", display: "block"};

interface Props {
    options: AutocompleteOptionView[];
    activeLiElementIndex: number,
    chooseOption: (option: AutocompleteOptionView) => Promise<void>;
}

function AutocompleteSearchBarDropdown({options, activeLiElementIndex, chooseOption}: Props): JSX.Element {
    const getLiElementClassNames = (i: number): string => {
        let liElementClassNames: string[] = LI_ELEMENT_CLASS_NAMES;
        if (activeLiElementIndex === i) {
            liElementClassNames = liElementClassNames.concat(ACTIVE_LI_ELEMENT_CLASS_NAMES);
        }
        return liElementClassNames.join(" ");
    };
    const mouseOverLiElementClassNames: string = MOUSE_OVER_LI_ELEMENT_CLASS_NAMES.join(" ");

    return (
        <ul
            // Rather than a list of <Option> elements, <li> and <ul> were chosen because:
            // Using <Option> will cause the dropdown to never show again whenever an option is chosen.
            // Using <Option> offers no way of distinguishing whether an option was chosen or the <Input>'s value was changed.
            className={UL_ELEMENT_CLASS_NAMES.join(" ")}
            style={UL_ELEMENT_STYLE}>
            {options.map((option: AutocompleteOptionView, i: number) => {
                return <li
                    className={getLiElementClassNames(i)}
                    onMouseOver={(e): void => {
                        e.currentTarget.classList.add(mouseOverLiElementClassNames);
                    }}
                    onMouseOut={(e): void => {
                        e.currentTarget.classList.remove(mouseOverLiElementClassNames);
                    }}
                    onMouseDown={async () => {
                        await chooseOption(option);
                    }}
                    key={option.query.value}
                >
                    {option.viewValue}
                </li>;
            })}
        </ul>
    );
}


export default AutocompleteSearchBarDropdown;