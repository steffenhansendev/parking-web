export interface ParkingOccupancyResponseDto extends Readonly<_ParkingOccupancyResponseDto> {
}

interface _ParkingOccupancyResponseDto {
    parkingLotId: string;
    data: Record<
        string, // UTC Time
        Record<
            string, // Space type
            number // Occupancy
        >
    >;
}