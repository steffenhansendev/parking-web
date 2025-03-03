import {ParkingOrganizationsResponseDto} from "./ParkingOrganizationResponseDto";
import {ParkingLotsResponseDto} from "./ParkingLotsResponseDto";
import {ParkingOccupancyRequestDto} from "./ParkingOccupancyRequestDto";
import {ParkingOccupancyResponseDto} from "./ParkingOccupancyResponseDto";

export interface ParkingApiClient {
    readOrganizations(): Promise<ParkingOrganizationsResponseDto []>;

    readParkingLots(organizationId: string): Promise<ParkingLotsResponseDto[]>;

    readOccupancy(requestDto: ParkingOccupancyRequestDto, abortController: AbortController): Promise<ParkingOccupancyResponseDto>;
}