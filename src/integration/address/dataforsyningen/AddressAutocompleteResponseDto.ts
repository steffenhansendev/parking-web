import {AddressAutocompleteAddressTypeDto} from "./AddressAutocompleteAddressTypeDto";

export interface AddressAutocompleteResponseDto {
    type: AddressAutocompleteAddressTypeDto;
    tekst: string;
    caretpos: number;
    forslagstekst: string;
    data: DataDto;
    stormodtagerpostnr: boolean;
}

export interface DataDto {
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