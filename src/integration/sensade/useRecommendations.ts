import {OccupancyDataDto} from "./OccupancyDataDto";
import React, {useRef} from "react";
import {calculateRecommendations} from "./calculate-recommendations";
import {Time} from "../../time/time";


import {ParkingApiUrlFactory} from "./ParkingApiUrlFactory";
import {Recommendation} from "../../recommendation/Recommendation";
import {ParkingLot, StallType} from "../../recommendation/Inclusion";

export function useRecommendations(setRecommendations: (recommendations: Recommendation[]) => void, setIsFetchingRecommendations: (isFetchingRecommendations: boolean) => void, urlFactory: ParkingApiUrlFactory):
    (lots: ParkingLot[], stallTypes: StallType[]) => void {
    const abortController: React.RefObject<AbortController> = useRef<AbortController>(new AbortController());
    return async (lots: ParkingLot[], stallTypes: StallType[]): Promise<void> => {
        setIsFetchingRecommendations(true);
        abortController.current.abort();
        abortController.current = new AbortController();
        lots = lots.filter((lot: ParkingLot): boolean => lot.isIncluded);
        stallTypes = stallTypes.filter((stallType: StallType): boolean => stallType.isIncluded);
        try {
            for (let i: number = 0; i < lots.length; i++) {
                const lot: ParkingLot = lots[i];
                let occupancyDtos: OccupancyDataDto[] = await fetchOccupancyDtos([lot], urlFactory, abortController.current);
                const recommendations: Recommendation[] = calculateRecommendations([lot], stallTypes, occupancyDtos);
                if (recommendations[0].numberOfAvailableStalls > 0) {
                    setRecommendations(recommendations);
                    return;
                }
            }
            setRecommendations([createNullObject()])
        } catch (e: unknown) {
            if (!(e instanceof Error)) {
                console.error("Fetching occupancy failed.");
                return;
            }
            if (e.name === "AbortError") {
                console.debug("useRecommendations() was invoked again.");
                return;
            }
            console.error(e);
        } finally {
            setIsFetchingRecommendations(false);
        }
    };
}

async function fetchOccupancyDtos(lots: ParkingLot[], urlFactory: ParkingApiUrlFactory, abortController: AbortController): Promise<OccupancyDataDto[]> {
    const now: Date = new Date();
    const year: number = now.getUTCFullYear();
    const weekNumber: number = Time.getIso8601UtcWeekNumber(now);
    const occupancyDtoPromises: Promise<OccupancyDataDto>[] = lots
        .map(async (lot: ParkingLot): Promise<OccupancyDataDto> => {
            const response: Response = await fetch(urlFactory.getOccupancyUrl(lot.id, weekNumber, year), {signal: abortController.signal});
            return (await response.json()) as OccupancyDataDto;
        });
    return await Promise.all(occupancyDtoPromises);
}


function createNullObject(): Recommendation {
    return {
        parkingLot: {
            id: "",
            name: "",
            capacities: [],
            isIncluded: false
        },
        numberOfAvailableStalls: 0
    }
}