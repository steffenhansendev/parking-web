import {AddressType} from "./create-address-options-manager";

// @ts-ignore
// Webpack
const HOST: string = ADDRESS_API_HOST;
// @ts-ignore
// Webpack
const URI: string = ADDRESS_API_BASE_URI;
const maxNumberOfResults: number = 10;

export interface DataForsyningenClient {
    httpGetAutocomplete: (query: AutocompleteQuery) => Promise<AutoCompleteResultDto[]>
}

export function createDataforsyningenClient(): DataForsyningenClient {
    return {
        httpGetAutocomplete: async (query: AutocompleteQuery): Promise<AutoCompleteResultDto[]> => {
            const url: URL = getAutocompleteUrl(query);
            const response: Response = await fetch(url);
            return (await response.json()) as AutoCompleteResultDto[];
        }
    }
}

function getAutocompleteUrl(query: AutocompleteQuery): URL {
    const searchParameters: URLSearchParams = new URLSearchParams({
        "q": query.value,
        "caretpos": query.caretIndexInValue.toString(),
        "fuzzy": "",    // Not documented but always provided as such in Dataforsyningen's own client
        "per_side": maxNumberOfResults.toString()
    });
    query.scope?.type && searchParameters.append("type",
        mapToDataforsyningenAddressType(query.scope.type))
    query.scope?.entranceAddressId && searchParameters.append("adgangsaddresseid",
        query.scope.entranceAddressId);
    query.scope?.leastSpecificity && searchParameters.append("startfra",
        mapToDataforsyningenAddressType(query.scope.leastSpecificity))
    query.scope?.id && searchParameters.append("id",
        query.scope.id);
    return new URL(`${URI}?${searchParameters.toString()}`, HOST);
}

function mapToDataforsyningenAddressType(type: AddressType): DataforsyningenAddressType {
    switch (type) {
        case AddressType.Street:
            return "vejnavn";
        case AddressType.Entrance:
            return "adgangsadresse"
        case AddressType.Address:
        case undefined:
            return "adresse";
    }
}

export interface AutocompleteQuery {
    value: string;
    caretIndexInValue: number;
    scope?: {
        type?: AddressType;
        entranceAddressId?: string;
        leastSpecificity?: AddressType;
        id?: string;
    }
}

export interface AutoCompleteResultDto {
    type: DataforsyningenAddressType;
    tekst: string;
    caretpos: number;
    forslagstekst: string;
    data: Data;
    stormodtagerpostnr: boolean; // ??
}

export interface Data {
    id: string
    status: number
    darstatus: number
    vejkode: string
    vejnavn: string
    adresseringsvejnavn: string
    husnr: string
    etage?: string
    dør: any
    supplerendebynavn: any
    postnr: string
    postnrnavn: string
    stormodtagerpostnr: any
    stormodtagerpostnrnavn: any
    kommunekode: string
    adgangsadresseid?: string // only present if type === adresse
    x: number
    y: number
    href: string
}

export type DataforsyningenAddressType = "vejnavn" | "adgangsadresse" | "adresse";
