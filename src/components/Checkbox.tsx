import React, {JSX} from "react";

interface Props {
    label?: string;
    isChecked: boolean;
    handleOnChange: () => void;
}

function RadioButton({label, isChecked = false, handleOnChange}: Props): JSX.Element {
    return (
        <>
            <div>
                <input type="checkbox" checked={isChecked} onChange={handleOnChange}/>
                <label>{label}</label>
            </div>
        </>
    );
}

export default RadioButton;