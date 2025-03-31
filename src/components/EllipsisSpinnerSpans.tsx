import React, {JSX, RefObject, useEffect, useRef, useState} from "react";

interface Props {
    dotCount: number;
    intervalInMilliseconds: number
}

function EllipsisSpinnerSpans({dotCount, intervalInMilliseconds}: Props): JSX.Element {
    const [dotVisibilities, setDotVisibilities] = useState<boolean[]>(Array(dotCount).fill(false));

    let i: RefObject<number> = useRef<number>(0);
    useEffect((): () => void => {
        const intervalId: number = window.setInterval((): void => {
            const nextEllipsisVisibilities: boolean[] = dotVisibilities.map((_: boolean, j: number): boolean => j === i.current);
            setDotVisibilities(nextEllipsisVisibilities);
            i.current = (i.current + 1) % nextEllipsisVisibilities.length;
        }, intervalInMilliseconds);
        return (): void => clearInterval(intervalId);
    }, []);

    return <>{
        dotVisibilities.map((isVisible: boolean, i: number): JSX.Element => {
            return <span key={i} style={isVisible ? {visibility: "visible"} : {visibility: "hidden"}}>.</span>
        })
    }</>
}

EllipsisSpinnerSpans.defaultProps = {
    dotCount: 3,
    intervalInMilliseconds: 250
}

export default EllipsisSpinnerSpans;