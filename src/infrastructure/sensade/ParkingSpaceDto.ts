export interface ParkingSpaceDto extends Readonly<_ParkingSpaceDto> {
}

interface _ParkingSpaceDto {
    spaceType?: string;
    capacity: number;
}