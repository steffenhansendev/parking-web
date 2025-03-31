import React, {useRef} from "react";
import {calculateRecommendations} from "./calculate-recommendations";
import {Time} from "../../time/time";
import {Recommendation} from "../../recommendation/Recommendation";
import {ParkingLot, StallType} from "../../recommendation/Inclusion";
import {createParkingApiClient} from "./sensade/create-parking-api-client";
import {ParkingApiClient} from "./sensade/ParkingApiClient";
import {ParkingOccupancyRequestDto} from "./sensade/ParkingOccupancyRequestDto";
import {ParkingOccupancyResponseDto} from "./sensade/ParkingOccupancyResponseDto";

export function useRecommendations(setRecommendations: (recommendations: Recommendation[]) => void, setIsFetchingRecommendations: (isFetchingRecommendations: boolean) => void):
    (lots: ParkingLot[], stallTypes: StallType[]) => void {
    const abortController: React.RefObject<AbortController> = useRef<AbortController>(new AbortController());
    return async (lots: ParkingLot[], stallTypes: StallType[]): Promise<void> => {
        setIsFetchingRecommendations(true);
        abortController.current.abort();
        abortController.current = new AbortController();
        lots = lots.filter((lot: ParkingLot): boolean => lot.isIncluded);
        stallTypes = stallTypes.filter((stallType: StallType): boolean => stallType.isIncluded);
        try {
            let recommendations: Recommendation[] = [];
            for (let i: number = 0; i < lots.length; i++) {
                const lot: ParkingLot = lots[i];
                let occupancyDtos: ParkingOccupancyResponseDto[] = await fetchOccupancyDtos([lot], abortController.current);
                recommendations = calculateRecommendations([lot], stallTypes, occupancyDtos);
                if (recommendations[0].numberOfAvailableStalls > 0) {
                    setRecommendations(recommendations);
                    return;
                }
            }
            setRecommendations(recommendations);
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

async function fetchOccupancyDtos(lots: ParkingLot[], abortController: AbortController): Promise<ParkingOccupancyResponseDto[]> {
    const client: ParkingApiClient = createParkingApiClient();
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