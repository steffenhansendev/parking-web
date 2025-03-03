import {ParkingLot} from "./create-parking-lot";
import {Recommendation} from "./Recommendation";
import {Availability} from "./Availability";

export async function calculateClosestStallLot(lots: ParkingLot[], stallTypes: Set<string>, latitude: number, longitude: number):
    Promise<Recommendation | null> {
    lots
        .sort((lotA: ParkingLot, lotB: ParkingLot): number => {
            const distanceToLotA: number | null = lotA.calculateDistanceInMeters(latitude, longitude);
            const distanceToLotB: number | null = lotB.calculateDistanceInMeters(latitude, longitude);
            return (distanceToLotA ?? Number.MAX_SAFE_INTEGER) - (distanceToLotB ?? Number.MAX_SAFE_INTEGER);
        });
    for (const lot of lots) {
        const latestAvailability: Availability = await lot.getLatestAvailability(stallTypes);
        if (latestAvailability.count > 0) {
            return {parkingLot: lot, availability: latestAvailability};
        }
    }
    return null;
}