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

export function createParkingService(apiClient: ParkingApiClient): ParkingService {
    const _apiClient: ParkingApiClient = apiClient;
    return {
        async getParkingLots(): Promise<ParkingLot[]> {
            const organizationDtos: ParkingOrganizationsResponseDto[] = await _apiClient.readOrganizations();
            const parkingLotDtos: ParkingLotsResponseDto[] = await _apiClient.readParkingLots(organizationDtos[0].id);
            return parkingLotDtos
                .filter((dto: ParkingLotsResponseDto): boolean => !!dto.name)
                .map((dto: ParkingLotsResponseDto): ParkingLot => mapToParkingLot(dto, apiClient));
        }
    }
}

function mapToParkingLot(dto: ParkingLotsResponseDto, apiClient: ParkingApiClient): ParkingLot {
    let lotStallGroups: StallGroup[] = [];
    if (dto.spaces) {
        lotStallGroups = dto.spaces
            .map((space: ParkingSpaceDto): StallGroup => {
                const stallType: string = filterStallType(space.spaceType);
                return createStallGroup(stallType, space.capacity);
            });
    }
    return createParkingLot(
        dto.id,
        dto.name!,
        lotStallGroups,
        async (): Promise<Map<string, Map<number, number>>> => {
            return await getOccupancy(dto.id, apiClient);
        },
        dto.latitude ?? null,
        dto.longitude ?? null
    );
}

async function getOccupancy(parkingLotId: string, apiClient: ParkingApiClient): Promise<Map<string, Map<number, number>>> {
    const now: Date = new Date();
    const requestDto: ParkingOccupancyRequestDto = {
        parkingLotId: parkingLotId,
        utcWeek: Time.getIso8601UtcWeekNumber(now),
        utcYear: now.getUTCFullYear()
    }
    const responseDto: ParkingOccupancyResponseDto = await apiClient.readOccupancy(requestDto, new AbortController());
    return mapToOccupancyByTimestampByStallType(responseDto.data);
}

function filterStallType(stallType: string | undefined): string {
    if (!stallType) {
        return "undefined";
    }
    stallType = stallType.toLowerCase();
    if (stallType === "handicap") {
        stallType = "disability";
    }
    return stallType;
}

function mapToOccupancyByTimestampByStallType(occupancyByStallTypeByDateTime: Record<string, Record<string, number>>): Map<string, Map<number, number>> {
    return Object.entries(occupancyByStallTypeByDateTime)
        .reduce<Map<string, Map<number, number>>>((accumulator: Map<string, Map<number, number>>, [dateTimeString, occupancyByStallType]: [string, Record<string, number>]): Map<string, Map<number, number>> => {
            Object.entries(occupancyByStallType).forEach(([stallType, occupancyPercentage]: [string, number]): void => {
                stallType = filterStallType(stallType);
                if (!accumulator.get(stallType)) {
                    accumulator.set(stallType, new Map());
                }
                const dateTime: Date = new Date(Date.parse(dateTimeString));
                let timestamp: number = dateTime.valueOf();
                accumulator.get(stallType)!.set(timestamp, occupancyPercentage);
            });
            return accumulator;
        }, new Map());
}