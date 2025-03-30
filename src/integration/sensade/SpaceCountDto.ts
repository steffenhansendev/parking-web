export interface SpaceCountDto extends Readonly<_SpaceCountDto> {
}

interface _SpaceCountDto {
    spaceType?: string;
    capacity: number;
}