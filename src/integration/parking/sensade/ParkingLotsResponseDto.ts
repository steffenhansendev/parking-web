import {ParkingSpaceDto} from "./ParkingSpaceDto";

export interface ParkingLotsResponseDto extends Readonly<_ParkingLotsResponseDto> {
}

interface _ParkingLotsResponseDto {
    id: string;
    name?: string;
    longitude?: number;
    latitude?: number;
    spaces?: ParkingSpaceDto[];
    included: boolean;
}