import {SpaceCountDto} from "./SpaceCountDto";

export interface ParkingLotMetadataDto {
    id: string;
    name?: string;
    longitude?: number;
    latitude?: number;
    spaces?: SpaceCountDto[];
    included: boolean;
}