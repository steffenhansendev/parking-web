import {useEffect} from "react";
import {ParkingSpaceDto} from "./sensade/ParkingSpaceDto";
import {ParkingLot, StallType} from "../../recommendation/Inclusion";
import {ParkingApiClient} from "./sensade/ParkingApiClient";
import {ParkingOrganizationDto} from "./sensade/ParkingOrganizationResponseDto";
import {ParkingLotsResponseDto} from "./sensade/ParkingLotsResponseDto";
import {useDi} from "../../dependency-injection/DiProvider";

const STALL_TYPES_INCLUDED_BY_DEFAULT: string[] = [
    "default",
    "curb",
    // "handicap",
    // "forbidden",
    // "delivery"
];

export function useInclusions(setParkingLots: (value: ParkingLot[]) => void, setStallTypes: (value: StallType[]) => void, setIsFetching: (value: boolean) => void): void {
    const client: ParkingApiClient = useDi().resolveParkingApiClient();
    useEffect((): void => {
        (async (): Promise<void> => {
            try {
                setIsFetching(true);
                const organizationDtos: ParkingOrganizationDto[] = await client.readOrganizations();
                const lotDtos: ParkingLotsResponseDto[] = await client.readLots(organizationDtos[0].id);
                const nextParkingLots: ParkingLot[] = lotDtos.map((lotDto: ParkingLotsResponseDto): ParkingLot => mapToParkingLot(lotDto));
                setParkingLots(nextParkingLots);
                let allTypes: string[] = lotDtos
                    .map((dto: ParkingLotsResponseDto) => dto.spaces ?? [])
                    .flat(1)
                    .map((s) => s.spaceType?.toLowerCase())
                    .filter((s) => s !== undefined);
                const distinctTypes: string[] = toDistinct(allTypes);
                const nextStallTypes: StallType[] = distinctTypes.map((distinctType: string): StallType => mapToStallType(distinctType));
                setStallTypes(nextStallTypes);
            } catch (e: unknown) {
                console.error(e);
            } finally {
                setIsFetching(false);
            }
        })();
    }, []);
}

function toDistinct(strings: string[]): string[] {
    const distinctStrings: string[] = [];
    strings.forEach((s: string): void => {
        if (!distinctStrings.includes(s)) {
            distinctStrings.push(s);
        }
    });
    return distinctStrings;
}

function mapToParkingLot(lotDto: ParkingLotsResponseDto): ParkingLot {
    return {
        id: lotDto.id,
        name: lotDto.name,
        capacities: (lotDto.spaces ?? [])
            .filter((spaceDto: ParkingSpaceDto): boolean => !!spaceDto.spaceType)
            .map((spaceDto: ParkingSpaceDto): { stallType: string, count: number } =>
                ({
                    stallType: spaceDto.spaceType!.toLowerCase(), // Filtered
                    count: spaceDto.capacity
                })
            ),
        isIncluded: false,
        location: {
            latitude: lotDto.latitude ?? 0,
            longitude: lotDto.longitude ?? 0
        }
    };
}

function mapToStallType(stallTypeString: string): StallType {
    return {
        value: stallTypeString,
        isIncluded: STALL_TYPES_INCLUDED_BY_DEFAULT.includes(stallTypeString)
    };
}