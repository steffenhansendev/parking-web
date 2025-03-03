import React, {Context, createContext, JSX, ReactNode, useContext} from "react";

export interface DiContainer {
}

const DiContext: Context<DiContainer | null> = createContext<DiContainer | null>(null);

export function useDi(): DiContainer {
    return useContext(DiContext)!;
}

export function DiProvider({children, partialContainerFromThisComponentDown = {}}: {
    children: ReactNode,
    partialContainerFromThisComponentDown?: Partial<DiContainer>
}): JSX.Element {
    const partialContainerInComponentAbove: DiContainer = useContext(DiContext) ?? {};
    const mergedContainer: DiContainer = {...partialContainerInComponentAbove, ...partialContainerFromThisComponentDown};
    return (
        <DiContext.Provider value={mergedContainer}>{children}</DiContext.Provider>
    );
}