import {Coordinates} from "./Coordinates";
import {AddressType} from "./AddressType";

export interface Address {
    readonly id: string;
    readonly type: AddressType;
    readonly location: Coordinates;
    readonly entranceAddressId: string | null; // Only for type = Address
}

export function createAddress(id: string, addressType: AddressType, location: Coordinates, entranceAddressId: string | null): Address {
    return {
        id: id,
        type: addressType,
        location: location,
        entranceAddressId: entranceAddressId
    }
}