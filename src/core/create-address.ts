import {Coordinates} from "./Coordinates";

export interface Address {
    readonly id: string;
    readonly type: AddressType;
    readonly location: Coordinates;
    readonly entranceAddressId: string | null; // Only for type = Address
}

export enum AddressType {
    Entrance,
    Address
}

export function createAddress(id: string, addressType: AddressType, location: Coordinates, entranceAddressId: string | null): Address {
    return {
        id: id,
        type: addressType,
        location: location,
        entranceAddressId: entranceAddressId
    }
}