export interface Inclusion {
    isIncluded: boolean;
}

export interface StallType extends Inclusion {
    value: string
}

export interface StallCount {
    stallType: string,
    count: number
}

export interface ParkingLot extends Inclusion {
    id: string;
    name: string | undefined;
    capacities: StallCount[];
}