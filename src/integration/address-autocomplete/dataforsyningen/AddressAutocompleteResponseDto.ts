export interface AddressAutocompleteResponseDto extends Readonly<_AddressAutocompleteResponseDto> {
}

export type AddressAutocompleteValueObjectTypeDto = "vejnavn";
export type AddressAutocompleteTypeDto = AddressAutocompleteValueObjectTypeDto & AddressAutocompleteEntityTypeDto;

interface _AddressAutocompleteResponseDto {
    type: AddressAutocompleteTypeDto;
    tekst: string;
    caretpos: number;
    forslagstekst: string;
    data: DataDto;
    stormodtagerpostnr: boolean;
}

export interface DataDto extends Readonly<_DataDto> {
}

interface _DataDto {
    id: string
    status: number
    darstatus: number
    vejkode: string
    vejnavn: string
    adresseringsvejnavn: string
    husnr: string
    etage: string
    dør: any
    supplerendebynavn: any
    postnr: string
    postnrnavn: string
    stormodtagerpostnr: any
    stormodtagerpostnrnavn: any
    kommunekode: string
    adgangsadresseid: string // only present if type = adresse
    x: number
    y: number
    href: string
}

export type AddressAutocompleteEntityTypeDto = "adgangsadresse" | "adresse";