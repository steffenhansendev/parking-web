export interface AutocompleteAddressResponseDto extends Readonly<_AutocompleteAddressResponseDto> {
}

export type AutocompleteAddressValueObjectTypeDto = "vejnavn";
export type AutocompleteAddressTypeDto = AutocompleteAddressValueObjectTypeDto & AutocompleteAddressEntityTypeDto;

interface _AutocompleteAddressResponseDto {
    type: AutocompleteAddressTypeDto;
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

export type AutocompleteAddressEntityTypeDto = "adgangsadresse" | "adresse";