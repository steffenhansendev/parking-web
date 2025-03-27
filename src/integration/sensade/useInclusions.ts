import {useEffect} from "react";
import {SparseOrganizationDto} from "./SparseOrganizationDto";
import {ParkingLotMetadataDto} from "./ParkingLotMetadataDto";
import {SpaceCountDto} from "./SpaceCountDto";
import {ParkingApiUrlFactory} from "./ParkingApiUrlFactory";
import {ParkingLot, StallType} from "../../recommendation/Inclusion";

const STALL_TYPES_INCLUDED_BY_DEFAULT: string[] = [
    "default",
    "curb",
    // "handicap",
    // "forbidden",
    // "delivery"
];

export function useInclusions(setParkingLots: (value: ParkingLot[]) => void, setStallTypes: (value: StallType[]) => void, setIsFetching: (value: boolean) => void, urlFactory: ParkingApiUrlFactory): void {
    useEffect((): void => {
        (async (): Promise<void> => {
            let lotDtos: ParkingLotMetadataDto[] = [];
            try {
                setIsFetching(true);
                const organizationDtosResponse: Response = await fetch(urlFactory.getOrganizationsUrl());
                const organizationDtos: SparseOrganizationDto[] = (await organizationDtosResponse.json()) as SparseOrganizationDto[];
                const lotDtoReponses: Response = await fetch(urlFactory.getParkingLotsUrl(organizationDtos[0].id));
                lotDtos = (await lotDtoReponses.json()) as ParkingLotMetadataDto[];
                const nextParkingLots: ParkingLot[] = lotDtos.map((lotDto: ParkingLotMetadataDto): ParkingLot => mapToParkingLot(lotDto));
                setParkingLots(nextParkingLots);
                const distinctTypes: string[] = [];
                lotDtos.forEach((lotDto: ParkingLotMetadataDto): void => {
                    lotDto.spaces?.forEach((spaceDto: SpaceCountDto): void => {
                        const spaceType: string | undefined = spaceDto.spaceType?.toLowerCase();
                        if (spaceType && !distinctTypes.includes(spaceType)) {
                            distinctTypes.push(spaceType);
                        }
                    });
                });
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

function mapToParkingLot(lotDto: ParkingLotMetadataDto): ParkingLot {
    return {
        id: lotDto.id,
        name: lotDto.name,
        capacities: (lotDto.spaces ?? [])
            .filter((spaceDto: SpaceCountDto): boolean => !!spaceDto.spaceType)
            .map((spaceDto: SpaceCountDto): { stallType: string, count: number } =>
                ({
                    stallType: spaceDto.spaceType!.toLowerCase(), // Filtered
                    count: spaceDto.capacity
                })
            ),
        isIncluded: false,
        location: lotDto.latitude && lotDto.longitude ? {
            latitude: lotDto.latitude,
            longitude: lotDto.longitude
        } : undefined
    };
}

function mapToStallType(stallTypeString: string): StallType {
    return {
        value: stallTypeString,
        isIncluded: STALL_TYPES_INCLUDED_BY_DEFAULT.includes(stallTypeString)
    };
}