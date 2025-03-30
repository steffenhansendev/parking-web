export interface Inclusion {
    isIncluded: boolean;
}

export interface StallType extends Inclusion {
    // To allow the back end to change these without breaking the front, plain string was chosen over enum and a type union of strings
    readonly value: string;
}

export interface ParkingLot extends Inclusion {
    readonly id: string;
    readonly name: string | undefined;
    readonly capacities: StallCount[];
    readonly location: Coordinates;
    distanceFromUserInMeters?: number;
}

export interface Coordinates {
    readonly longitude: number;
    readonly latitude: number;
}

export interface StallCount {
    readonly stallType: string;
    readonly count: number;
}