export interface ParkingOccupancyRequestDto extends Readonly<_ParkingOccupancyRequestDto> {
}

interface _ParkingOccupancyRequestDto {
    parkingLotId: string;
    utcYear: number;
    utcWeek: number;
}