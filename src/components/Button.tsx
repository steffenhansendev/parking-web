import React, {JSX} from "react";

interface Props {
    title: string;
    handleOnClick: () => void;
}

function Button({title, handleOnClick}: Props): JSX.Element {
    return (
        <>
            <div>
                <button onClick={handleOnClick} type="button" className="btn btn-primary">
                    {title}
                </button>
            </div>
        </>
    );
}

export default Button;