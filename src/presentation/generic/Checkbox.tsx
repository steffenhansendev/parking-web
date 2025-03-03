import React, {JSX} from "react";

interface Props {
    label?: string;
    isChecked: boolean;
    handleOnChange: () => void;
}

function Checkbox({label, isChecked = false, handleOnChange}: Props): JSX.Element {
    return (
        <>
            <div className="form-check">
                <input type="checkbox" checked={isChecked} onChange={handleOnChange} className="form-check-input"/>
                <label className="form-check-label">{label}</label>
            </div>
        </>
    );
}

export default Checkbox;