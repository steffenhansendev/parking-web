import {SpaceCountDto} from "./SpaceCountDto";

export interface ParkingLotMetadataDto extends Readonly<_ParkingLotMetadataDto> {
}

interface _ParkingLotMetadataDto {
    id: string;
    name?: string;
    longitude?: number;
    latitude?: number;
    spaces?: SpaceCountDto[];
    included: boolean;
}