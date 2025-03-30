export interface OccupancyDataDto extends Readonly<_OccupancyDataDto> {
}

interface _OccupancyDataDto {
    parkingLotId: string;
    data: Record<
        string, // UTC Time
        Record<
            string, // Space type
            number // Occupancy
        >
    >;
}