import React, {useRef} from "react";
import {calculateRecommendations} from "./calculate-recommendations";
import {Time} from "../../time/time";
import {Recommendation} from "../../recommendation/Recommendation";
import {ParkingLot, StallType} from "../../recommendation/Inclusion";
import {ParkingApiClient} from "./sensade/ParkingApiClient";
import {ParkingOccupancyRequestDto} from "./sensade/ParkingOccupancyRequestDto";
import {ParkingOccupancyResponseDto} from "./sensade/ParkingOccupancyResponseDto";
import {useDi} from "../../dependency-injection/DiProvider";
import BEGINNING_OF_TIME = Time.BEGINNING_OF_TIME;

export function useRecommendations(setRecommendations: (recommendations: Recommendation[]) => void, setIsFetchingRecommendations: (isFetchingRecommendations: boolean) => void):
    (lots: ParkingLot[], stallTypes: StallType[]) => void {
    const abortController: React.RefObject<AbortController> = useRef<AbortController>(new AbortController());
    const apiClient: ParkingApiClient = useDi().resolveParkingApiClient();
    return async (lots: ParkingLot[], stallTypes: StallType[]): Promise<void> => {
        if (stallTypes.length < 1 || lots.length < 1) {
            setRecommendations([createNullObject()]);
            return;
        }
        setIsFetchingRecommendations(true);
        abortController.current.abort();
        abortController.current = new AbortController();
        lots = lots.filter((lot: ParkingLot): boolean => lot.isIncluded);
        stallTypes = stallTypes.filter((stallType: StallType): boolean => stallType.isIncluded);
        try {
            let recommendations: Recommendation[] = [];
            for (let i: number = 0; i < lots.length; i++) {
                const lot: ParkingLot = lots[i];
                let occupancyDtos: ParkingOccupancyResponseDto[] = await fetchOccupancyDtos([lot], apiClient, abortController.current);
                recommendations = calculateRecommendations([lot], stallTypes, occupancyDtos);
                if (recommendations[0]?.availableStallCount > 0) {
                    setRecommendations(recommendations);
                    return;
                }
            }
            setRecommendations([createNullObject()]);
            return;
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

async function fetchOccupancyDtos(lots: ParkingLot[], client: ParkingApiClient, abortController: AbortController): Promise<ParkingOccupancyResponseDto[]> {
    const now: Date = new Date();
    const year: number = now.getUTCFullYear();
    const weekNumber: number = Time.getIso8601UtcWeekNumber(now);
    const occupancyDtoPromises: Promise<ParkingOccupancyResponseDto>[] = lots
        .map(async (lot: ParkingLot): Promise<ParkingOccupancyResponseDto> => {
            const requestDto: ParkingOccupancyRequestDto = {
                parkingLotId: lot.id,
                utcWeek: weekNumber,
                utcYear: year
            }
            return await client.readOccupancy(requestDto, abortController);
        });
    return await Promise.all(occupancyDtoPromises);
}

function createNullObject(): Recommendation {
    return {
        parkingLot: {
            id: "",
            name: "",
            capacities: [],
            isIncluded: false,
            location: {latitude: 0, longitude: 0}
        },
        availableStallCount: 0,
        asOf: BEGINNING_OF_TIME
    }
}
