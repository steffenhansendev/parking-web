import {Address} from "../../recommendation/Address";
import {AutocompleteDto, DataforsyningenAddressType} from "./AutocompleteDto";
import {AddressType, Option} from "./Option";

const HOST: string = "https://api.dataforsyningen.dk";
const URI: string = "autocomplete";

export async function getOptions(value: string, caretIndexInValue: number): Promise<Option[]> {
    return await search({
        value: value,
        caretIndexInValue: caretIndexInValue
    });
}

export async function getMoreSpecificOptions(option: Option): Promise<Option[]> {
    const parameters: SearchParameters = {
        value: option.queryValue,
        caretIndexInValue: option.caretIndexInQueryValue ?? option.queryValue.length,
        type: AddressType.Address,
    }
    switch (option.type) {
        case AddressType.Street:
            parameters.leastSpecificity = AddressType.Entrance;
            break;
        case AddressType.Entrance:
            parameters.entranceAddressId = option.id;
            break;
        case AddressType.Address:
            parameters.entranceAddressId = option.accessAddressId;
            break;
    }
    return await search(parameters);
}

interface SearchParameters {
    value: string;
    caretIndexInValue: number;
    type?: AddressType;
    entranceAddressId?: string;
    leastSpecificity?: AddressType;
    id?: string;
}

async function search(parameters: SearchParameters): Promise<Option[]> {
    const searchParameters: URLSearchParams = new URLSearchParams({
        q: parameters.value,
        caretpos: parameters.caretIndexInValue.toString(),
        fuzzy: "",
        per_side: "10",
        type: mapToDataforsyningenAddressType(parameters.type)
    });
    if (parameters.entranceAddressId) {
        searchParameters.append("adgangsaddresseid", parameters.entranceAddressId);
    }
    if (parameters.leastSpecificity) {
        searchParameters.append("startfra", mapToDataforsyningenAddressType(parameters.leastSpecificity))
    }
    if (parameters.id) {
        searchParameters.append("id", parameters.id);
    }
    const url: URL = new URL(`${URI}?${searchParameters.toString()}`, HOST);
    const response: Response = await fetch(url);
    const dtos = (await response.json()) as AutocompleteDto[];
    return mapToOptions(dtos);
}

function mapToOptions(dtos: AutocompleteDto[]): Option[] {
    return dtos.map((dto: AutocompleteDto): Option => {
        return {
            viewValue: dto.forslagstekst,
            queryValue: dto.tekst,
            caretIndexInQueryValue: dto.caretpos,
            type: mapToAddressType(dto.type),
            id: dto.data.id,
            accessAddressId: dto.data.adgangsadresseid,
            isCommittable: function (): boolean {
                return this.type === AddressType.Entrance || this.type === AddressType.Address;
            },
            isChoice: function (query: string): boolean {
                return query.toLowerCase() === this.queryValue.toLowerCase() || query.toLowerCase() === this.viewValue.toLowerCase();
            },
            isFurtherSpecifiable: function (): boolean {
                return !(this.type === AddressType.Address);
            },
            getResult: function (): Address {
                return {
                    name: this.isFurtherSpecifiable() ? this.viewValue : this.queryValue,
                    location: {
                        latitude: dto.data.y,
                        longitude: dto.data.x
                    }
                }
            }
        };
    });
}

function mapToAddressType(type: DataforsyningenAddressType): AddressType {
    switch (type) {
        case "vejnavn":
            return AddressType.Street;
        case "adgangsadresse":
            return AddressType.Entrance;
        case "adresse":
            return AddressType.Address;
    }
}

function mapToDataforsyningenAddressType(type: AddressType | undefined): DataforsyningenAddressType {
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