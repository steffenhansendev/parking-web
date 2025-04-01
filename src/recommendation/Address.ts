import {Coordinates} from "./Coordinates";

export interface Address {
    readonly name: string;
    readonly location: Coordinates;
}