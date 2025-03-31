import {ParkingOrganizationDto} from "./ParkingOrganizationResponseDto";
import {ParkingLotsResponseDto} from "./ParkingLotsResponseDto";
import {ParkingOccupancyRequestDto} from "./ParkingOccupancyRequestDto";
import {ParkingOccupancyResponseDto} from "./ParkingOccupancyResponseDto";

export interface ParkingApiClient {
    readOrganizations(): Promise<ParkingOrganizationDto []>;

    readLots(organizationId: string): Promise<ParkingLotsResponseDto[]>;

    readOccupancy(requestDto: ParkingOccupancyRequestDto, abortController: AbortController): Promise<ParkingOccupancyResponseDto>;
}