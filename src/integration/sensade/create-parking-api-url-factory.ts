import {ParkingApiUrlFactory} from "./ParkingApiUrlFactory";

export function createParkingApiUrlFactory(): ParkingApiUrlFactory {
// @ts-ignore
    const HOST: string = PARKING_API_HOST;
// @ts-ignore
    const BASE_URI: string = PARKING_API_BASE_URI;
    return {
        getOrganizationsUrl: function (): URL {
            return new URL(`${BASE_URI}/opendata/organizations`, HOST);
        },
        getParkingLotsUrl: function (organizationId: string): URL {
            return new URL(`${BASE_URI}/opendata/organizations/${organizationId}/parkinglots`, HOST);
        },
        getOccupancyUrl: function (parkingLotId: string, weekNumber: number, year: number) {
            const searchParameters: URLSearchParams = new URLSearchParams({
                LotId: parkingLotId,
                WeekNumber: weekNumber.toString(),
                Year: year.toString()
            });
            return new URL(`${BASE_URI}/opendata/parkinglots/occupancy?${searchParameters.toString()}`, HOST);
        }
    }
}