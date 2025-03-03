import {OccupancyDataDto} from "./OccupancyDataDto";
import {Time} from "../time/time";
import {Recommendation} from "../recommendation/Recommendation";
import {ParkingLot, StallCount, StallType} from "../recommendation/Inclusion";

// This should not know about DTOs
// This should be split into smaller functions

export function calculateRecommendations(lots: ParkingLot[], stallTypes: StallType[], occupancyDtos: OccupancyDataDto[]): Recommendation[] {
    let maximumAvailability: number = 0;
    let lotOfMaximumAvailability: ParkingLot | undefined;
    let timeOfStalestStallOccupancyInSumForLotOfMaximumAvailability: Date = Time.BEGINNING_OF_TIME;
    for (let i: number = 0; i < lots.length; i++) {
        const lot: ParkingLot = lots[i];
        const occupancyDto: OccupancyDataDto | undefined = occupancyDtos.find((occupancy: OccupancyDataDto): boolean => occupancy.parkingLotId === lot.id);
        if (!occupancyDto) {
            continue; // API error
        }
        const keyDates: string[] = Object.keys(occupancyDto.data)
            .sort((a: string, b: string): number => {
                return Date.parse(b) - Date.parse(a)
            });
        let sumOfAvailableStalls: number = 0;
        let timeOfStalestOccupancyInSum: Date = Time.BEGINNING_OF_TIME;
        // It varies for stall types of a lot at which time their occupancy is published
        // E.g., the latest occupancy for "curb" might be more recent than the latest occupancy for "default"
        const capacities: StallCount[] = lot.capacities
            .filter((capacity: StallCount): boolean => stallTypes.some((stallType: StallType): boolean => capacity.stallType === stallType.value));
        for (let j: number = 0; j < capacities.length; j++) {
            const capacity: StallCount = capacities[j];
            let freshestOccupancy: number | undefined;
            let timeOfStalestOccupancy: Date = Time.ENDING_OF_TIME;
            for (let k: number = 0; k < keyDates.length && (!freshestOccupancy); k++) {
                const occupancy: Record<string, number> = occupancyDto.data[keyDates[k]];
                freshestOccupancy = occupancy[capacity.stallType];
                if (!freshestOccupancy) {
                    continue; // This occupancy did not include a count for this stall type
                }
                const time: Date = new Date(Date.parse(keyDates[k]));
                if (time.valueOf() < timeOfStalestOccupancy.valueOf()) {
                    timeOfStalestOccupancy = time;
                }
            }
            if (!freshestOccupancy) {
                continue; // API Error
            }
            timeOfStalestOccupancyInSum = timeOfStalestOccupancy;
            const availability: number = capacity.count * (100 - freshestOccupancy) * 0.01;
            sumOfAvailableStalls += availability;
            if (sumOfAvailableStalls > maximumAvailability) {
                maximumAvailability = sumOfAvailableStalls;
                lotOfMaximumAvailability = lot;
                timeOfStalestStallOccupancyInSumForLotOfMaximumAvailability = timeOfStalestOccupancyInSum;
            }
        }
    }
    maximumAvailability = Math.floor(maximumAvailability);
    return [{
        parkingLot: lotOfMaximumAvailability,
        asOf: timeOfStalestStallOccupancyInSumForLotOfMaximumAvailability,
        numberOfAvailableStalls: maximumAvailability
    }];
}