import {Coordinates} from "./Coordinates";
import {Time} from "../time/time";
import BEGINNING_OF_TIME = Time.BEGINNING_OF_TIME;
import {StallGroup} from "./create-stall-group";
import geodesic from "geographiclib-geodesic";
import {Availability} from "./Availability";

export interface ParkingLot {
    readonly id: string;
    readonly name: string;

    getDistinctStallTypes(): Set<string>;

    getCapacity(stallTypes: Set<string>): number;

    getLatestAvailability(stallTypes: Set<string>): Promise<Availability>;

    upsertOccupancy(occupancyPercentageByTimestampByStallType: Map<string, Map<number, number>>): void;

    calculateDistanceInMeters(latitude: number, longitude: number): number | null;
}

export function createParkingLot(
    id: string,
    name: string,
    stallGroups: StallGroup[],
    getOccupancy: () => Promise<Map<string, Map<number, number>>>,
    locationLatitude: number | null,
    locationLongitude: number | null
): ParkingLot {
    let _id: string = id;
    let _name: string | null = name;
    let _location: Coordinates | null = locationLatitude && locationLongitude ? {
        latitude: locationLatitude,
        longitude: locationLongitude
    } : null;
    let _stallGroups: StallGroup[] = stallGroups;
    const _getOccupancy: () => Promise<Map<string, Map<number, number>>> = getOccupancy;

    return {
        id: _id,
        name: _name,
        getDistinctStallTypes,
        getCapacity,
        getLatestAvailability,
        upsertOccupancy,
        calculateDistanceInMeters
    }

    function getDistinctStallTypes(): Set<string> {
        const stallTypeSet: Set<string> = new Set<string>();
        _stallGroups.forEach((lotStalls: StallGroup) => {
            stallTypeSet.add(lotStalls.stallType)
        });
        return stallTypeSet;
    }

    function getCapacity(stallTypes: Set<string>): number {
        return _stallGroups
            .filter((st: StallGroup): boolean => stallTypes.has(st.stallType))
            .map((st: StallGroup): number => st.capacity)
            .reduce((previousCapacity: number, currentCapacity: number): number => previousCapacity + currentCapacity, 0);
    }

    async function getLatestAvailability(stallTypes: Set<string>): Promise<Availability> {
        const occupancy: Map<string, Map<number, number>> = await _getOccupancy();
        upsertOccupancy(occupancy);
        let asOf: Date = BEGINNING_OF_TIME;
        let sum: number = 0;
        _stallGroups
            .filter((st: StallGroup): boolean => stallTypes.has(st.stallType))
            .map((st: StallGroup): Availability | null => st.getLatestAvailability())
            .filter((a: Availability | null): a is Availability => a !== null)
            .forEach((a: Availability): void => {
                if (a.asOf.valueOf() > asOf.valueOf()) {
                    asOf = a.asOf;
                }
                sum += a.count;
            });
        return {asOf: asOf, count: Math.floor(sum)};
    }

    function upsertOccupancy(occupancyPercentageByTimestampByStallType: Map<string, Map<number, number>>): void {
        occupancyPercentageByTimestampByStallType
            .forEach((occupancyPercentageByTimestamp: Map<number, number>, stallType: string): void => {
                _stallGroups
                    .find((sg: StallGroup): boolean => sg.stallType === stallType)
                    ?.upsertOccupancy(occupancyPercentageByTimestamp);
            });
    }

    function calculateDistanceInMeters(latitude: number, longitude: number): number | null {
        if (!_location) {
            return null;
        }
        try {
            return geodesic
                .Geodesic
                .WGS84
                .Inverse(_location.latitude, _location.longitude, latitude, longitude).s12 ?? null;
        } catch (e: unknown) {
            return null;
        }
    }
}