// @ts-ignore
// Webpack
const HOST: string = ADDRESS_API_HOST;
// @ts-ignore
// Webpack
const URI: string = ADDRESS_API_BASE_URI;
const maxNumberOfResults: number = 10;

export interface DataforsyningenClient {
    httpGetAutocomplete: (query: AutocompleteQuery) => Promise<AutocompleteResultDto[]>
}

export function createDataforsyningenClient(): DataforsyningenClient {
    return {
        httpGetAutocomplete: async (query: AutocompleteQuery): Promise<AutocompleteResultDto[]> => {
            const url: URL = getAutocompleteUrl(query);
            const response: Response = await fetch(url);
            return (await response.json()) as AutocompleteResultDto[];
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
    query.scope?.type && searchParameters.append("type", query.scope.type)
    query.scope?.entranceAddressId && searchParameters.append("adgangsaddresseid", query.scope.entranceAddressId);
    query.scope?.leastSpecificity && searchParameters.append("startfra", query.scope.leastSpecificity);
    query.scope?.id && searchParameters.append("id", query.scope.id);
    return new URL(`${URI}?${searchParameters.toString()}`, HOST);
}

export interface AutocompleteQuery {
    value: string;
    caretIndexInValue: number;
    scope?: {
        type?: DataforsyningenAddressType;
        entranceAddressId?: string;
        leastSpecificity?: DataforsyningenAddressType;
        id?: string;
    }
}

export interface AutocompleteResultDto {
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