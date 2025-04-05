import {Time} from "../../time/time";
import {ParkingApiClient} from "./sensade/ParkingApiClient";
import {ParkingOrganizationsResponseDto} from "./sensade/ParkingOrganizationResponseDto";
import {ParkingLotsResponseDto} from "./sensade/ParkingLotsResponseDto";
import {ParkingSpaceDto} from "./sensade/ParkingSpaceDto";
import {ParkingOccupancyRequestDto} from "./sensade/ParkingOccupancyRequestDto";
import {ParkingOccupancyResponseDto} from "./sensade/ParkingOccupancyResponseDto";
import {createStallGroup, StallGroup} from "../../recommendation/create-stall-group";
import {createParkingLot, ParkingLot} from "../../recommendation/create-parking-lot";

export interface ParkingService {
    getParkingLots(): Promise<ParkingLot[]>;
}

/*
This maps between DTOs and domain objects since encapsulating domain logic in pertaining objects is necessary.
 */

export function createParkingService(apiClient: ParkingApiClient): ParkingService {
    const _apiClient: ParkingApiClient = apiClient;

    return {
        getParkingLots
    }

    async function getParkingLots(): Promise<ParkingLot[]> {
        const organizationDtos: ParkingOrganizationsResponseDto[] = await _apiClient.readOrganizations();
        const parkingLotDtos: ParkingLotsResponseDto[] = await _apiClient.readLots(organizationDtos[0].id);
        return parkingLotDtos
            .filter((dto: ParkingLotsResponseDto): boolean => !!dto.name)
            .map((dto: ParkingLotsResponseDto): ParkingLot => mapToParkingLot(dto));
    }

    async function getOccupancy(parkingLotId: string): Promise<Map<string, Map<number, number>>> {
        const now: Date = new Date();
        const requestDto: ParkingOccupancyRequestDto = {
            parkingLotId: parkingLotId,
            utcWeek: Time.getIso8601UtcWeekNumber(now),
            utcYear: now.getUTCFullYear()
        }
        const responseDto: ParkingOccupancyResponseDto = await _apiClient.readOccupancy(requestDto, new AbortController());
        return mapToOccupancyByTimestampByStallType(responseDto.data);
    }

    function mapToParkingLot(dto: ParkingLotsResponseDto): ParkingLot {
        let lotStallsCollection: StallGroup[] = [];
        if (dto.spaces) {
            lotStallsCollection = dto.spaces
                .map((space: ParkingSpaceDto): StallGroup => {
                    const stallType: string = space.spaceType?.toLowerCase() ?? "undefined";
                    return createStallGroup(stallType, space.capacity);
                });
        }
        return createParkingLot(
            dto.id,
            dto.name!,
            lotStallsCollection,
            async (): Promise<Map<string, Map<number, number>>> => {
                return await getOccupancy(dto.id);
            },
            dto.latitude ?? null,
            dto.longitude ?? null
        );
    }
}

function mapToOccupancyByTimestampByStallType(occupancyByStallTypeByDateTime: Record<string, Record<string, number>>): Map<string, Map<number, number>> {
    return Object.entries(occupancyByStallTypeByDateTime)
        .reduce<Map<string, Map<number, number>>>((accumulator: Map<string, Map<number, number>>, [dateTimeString, occupancyByStallType]: [string, Record<string, number>]): Map<string, Map<number, number>> => {
            Object.entries(occupancyByStallType).forEach(([stallType, occupancyPercentage]: [string, number]): void => {
                stallType = stallType.toLowerCase();
                if (!accumulator.get(stallType)) {
                    accumulator.set(stallType, new Map());
                }

                const dateTime: Date = new Date(Date.parse(dateTimeString));
                let timestamp: number = dateTime.valueOf();

                const offset: number = dateTime.getTimezoneOffset();
                const isDaylightSavingTimeInDenmark: boolean = offset === 2;
                if (isDaylightSavingTimeInDenmark) {
                    timestamp = compensateForObservedApiDiscrepancy(timestamp);
                }
                accumulator.get(stallType)!.set(timestamp, occupancyPercentage);
            });
            return accumulator;
        }, new Map());
}

const ONE_HOUR_IN_MILLISECONDS: number = 60 * 60 * 1000;

function compensateForObservedApiDiscrepancy(timestamp: number): number {
    // As soon as daylight saving time was implemented in Denmark, it was observed that occupancy was consistently
    // one hour less fresh.
    // I.e., before the data would be at most one hour stale, but after it would be at most two hours stale.
    // Hence, it is more likely that the server has not implemented daylight saving time rather than the coincidence
    // that the data permanently became exactly one hour more stale in correlation with the one-hour extra offset in
    // daylight saving time.
    return timestamp + ONE_HOUR_IN_MILLISECONDS;
}