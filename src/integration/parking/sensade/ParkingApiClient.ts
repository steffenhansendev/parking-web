import {ParkingOrganizationDto} from "./ParkingOrganizationResponseDto";
import {ParkingLotsResponseDto} from "./ParkingLotsResponseDto";
import {ParkingOccupancyRequestDto} from "./ParkingOccupancyRequestDto";
import {ParkingOccupancyResponseDto} from "./ParkingOccupancyResponseDto";

export interface ParkingApiClient {
    httpGetOrganizations(): Promise<ParkingOrganizationDto []>;

    httpGetParkingLots(organizationId: string): Promise<ParkingLotsResponseDto[]>;

    httpGetParkingLotOccupancy(requestDto: ParkingOccupancyRequestDto, abortController: AbortController): Promise<ParkingOccupancyResponseDto>;
}