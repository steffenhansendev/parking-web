import {ParkingLot} from "./create-parking-lot";

import {Recommendation} from "./Recommendation";
import {Availability} from "./Availability";
import { Time } from "../shared/time";

export async function calculateMaxAvailabilityLot(lots: ParkingLot[], stallTypes: Set<string>): Promise<Recommendation | null> {
    let maxAvailability: Availability = {
        count: -1,
        asOf: Time.ENDING_OF_TIME
    };
    let lotOfMaxAvailability: ParkingLot | null = null;
    for (const pl of lots) {
        const latestAvailability: Availability = await pl.getLatestAvailability(stallTypes);
        if (latestAvailability.count > maxAvailability.count) {
            maxAvailability = latestAvailability;
            lotOfMaxAvailability = pl;
        }
    }
    if (lotOfMaxAvailability) {
        return {parkingLot: lotOfMaxAvailability, availability: maxAvailability}
    }
    return null;
}