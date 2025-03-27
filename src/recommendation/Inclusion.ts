export interface Inclusion {
    isIncluded: boolean;
}

export interface StallType extends Inclusion {
    // To allow the back end to change these without breaking the front, plain string was chosen over enum and a type union of strings
    value: string;
}

export interface ParkingLot extends Inclusion {
    id: string;
    name: string | undefined;
    capacities: StallCount[];
    location?: Coordinates;
    distanceFromUserInMeters?: number
}

export interface Coordinates {
    longitude: number;
    latitude: number;
}

export interface StallCount {
    stallType: string,
    count: number
}