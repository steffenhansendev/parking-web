import {ParkingApiClient} from "./ParkingApiClient";
import {ParkingOccupancyRequestDto} from "./ParkingOccupancyRequestDto";
import {ParkingOrganizationDto} from "./ParkingOrganizationResponseDto";
import {ParkingLotsResponseDto} from "./ParkingLotsResponseDto";
import {ParkingOccupancyResponseDto} from "./ParkingOccupancyResponseDto";

// @ts-ignore
const HOST: string = PARKING_API_HOST;
// @ts-ignore
const BASE_URI: string = PARKING_API_BASE_URI;

export function createParkingClient(): ParkingApiClient {
    return {
        async httpGetOrganizations(): Promise<ParkingOrganizationDto[]> {
            const url: URL = new URL(`${BASE_URI}/opendata/organizations`, HOST);
            const response: Response = await fetch(url);
            return (await response.json()) as ParkingOrganizationDto[];
        },
        async httpGetParkingLots(organizationId: string): Promise<ParkingLotsResponseDto[]> {
            const url: URL = new URL(`${BASE_URI}/opendata/organizations/${organizationId}/parkinglots`, HOST);
            const response: Response = await fetch(url);
            return (await response.json()) as ParkingLotsResponseDto[];
        },
        async httpGetParkingLotOccupancy(requestDto: ParkingOccupancyRequestDto, abortController: AbortController): Promise<ParkingOccupancyResponseDto> {
            const url: URL = getOccupancyUrl(requestDto);
            const response: Response = await fetch(url, {signal: abortController.signal});
            return (await response.json()) as ParkingOccupancyResponseDto;
        }
    }
}

function getOccupancyUrl(requestDto: ParkingOccupancyRequestDto): URL {
    const searchParameters: URLSearchParams = new URLSearchParams({
        "lotid": requestDto.parkingLotId,
        "weeknumber": requestDto.utcWeek.toString(),
        "year": requestDto.utcYear.toString()
    });
    return new URL(`${BASE_URI}/opendata/parkinglots/occupancy?${searchParameters.toString()}`, HOST);
}