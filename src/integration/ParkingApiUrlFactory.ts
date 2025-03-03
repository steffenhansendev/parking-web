export interface ParkingApiUrlFactory {
    getOrganizationsUrl: () => URL;
    getParkingLotsUrl: (organizationId: string) => URL;
    getOccupancyUrl: (parkingLotId: string, weekNumber: number, year: number) => URL;
}