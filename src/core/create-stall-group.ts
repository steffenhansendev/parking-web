import {Availability} from "./Availability";

export interface StallGroup {
    readonly stallType: string;
    readonly capacity: number;

    getLatestAvailability(): Availability | null;

    upsertOccupancy(occupancyPercentageByTimestamp: Map<number, number>): void;
}

export function createStallGroup(stallType: string, capacityCount: number): StallGroup {
    let _stallType: string = stallType;
    let _capacity: number = capacityCount;
    let _occupancyPercentageByTimestamp: Map<number, number> = new Map<number, number>();

    return {
        stallType: _stallType,
        capacity: _capacity,
        getLatestAvailability,
        upsertOccupancy
    }

    function upsertOccupancy(occupancyPercentageByTimestamp: Map<number, number>): void {
        occupancyPercentageByTimestamp.forEach((occupancyPercentage: number, timestamp: number): void => {
            _occupancyPercentageByTimestamp.set(timestamp, occupancyPercentage);
        })
    }

    function getLatestAvailability(): Availability | null {
        let latest: number = -1;
        for (const timestamp of _occupancyPercentageByTimestamp.keys()) {
            if (timestamp > latest) {
                latest = timestamp;
            }
        }
        if (latest < 0) {
            return null;
        }
        return {
            asOf: new Date(latest),
            count: calculateAvailability(_occupancyPercentageByTimestamp.get(latest)!)
        }
    }

    function calculateAvailability(occupancy: number): number {
        return _capacity * occupancy / 100;
    }
}