import React, {Context, createContext, JSX, ReactNode, useContext} from "react";
import {DiContainer} from "./DiContainer";
import {createDiContainer} from "./create-di-container";

export function useDi(): DiContainer {
    return useContext(DiContext);
}

export function DiProvider({children, partialContainerFromThisComponentDown = {}}: {
    children: ReactNode,
    partialContainerFromThisComponentDown?: Partial<DiContainer>
}): JSX.Element {
    const partialContainerInComponentAbove: DiContainer = useDi() ?? createDiContainer;
    const mergedContainer: DiContainer = {...partialContainerInComponentAbove, ...partialContainerFromThisComponentDown};
    return (
        <DiContext.Provider value={mergedContainer}>{children}</DiContext.Provider>
    );
}

const DiContext: Context<DiContainer> = createContext<DiContainer>(createDiContainer());