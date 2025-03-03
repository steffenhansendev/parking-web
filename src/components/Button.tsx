import React, {JSX} from "react";

interface Props {
    title: string;
    handleOnClick: () => void;
}

function Button({title, handleOnClick}: Props): JSX.Element {
    return (
        <>
            <div>
                <button onClick={handleOnClick}>
                    {title}
                </button>
            </div>
        </>
    );
}

export default Button;