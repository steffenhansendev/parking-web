import {Coordinates} from "./Inclusion";

export interface Address {
    readonly name: string,
    readonly location: Coordinates
}