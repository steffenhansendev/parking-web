import React, {JSX} from "react";

interface Props {
    title: string;
    handleOnClick: () => void;
    classNames: string[];
}

function Button({title, handleOnClick, classNames}: Props): JSX.Element {
    return (
        <>
            <div>
                <button onClick={handleOnClick} type="button" className={"btn btn-primary " + classNames.join()}>
                    {title}
                </button>
            </div>
        </>
    );
}

export default Button;