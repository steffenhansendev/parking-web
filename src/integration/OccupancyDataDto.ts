export interface OccupancyDataDto {
    parkingLotId: string;
    data: Record<
        string, // UTC Time
        Record<
            string, // Space type
            number // Occupancy
        >
    >;
}