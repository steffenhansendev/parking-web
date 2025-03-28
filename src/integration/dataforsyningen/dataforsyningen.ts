import {Address} from "../../recommendation/Address";
import {AutocompleteDto, DataforsyningenAddressType} from "./AutocompleteDto";
import {AddressType, Option} from "./Option";
import {AddressApiUrlFactory, AutocompleteQuery} from "./AddressApiUrlFactory";
import {createAddressApiUrlFactory} from "./create-address-api-url-factory";

export async function getOptions(value: string, caretIndexInValue: number): Promise<Option[]> {
    return await search({
        value: value,
        caretIndexInValue: caretIndexInValue,
    });
}

export async function getMoreSpecificOptions(option: Option): Promise<Option[]> {
    const query: AutocompleteQuery = {
        value: option.queryValue,
        caretIndexInValue: option.caretIndexInQueryValue ?? option.queryValue.length,
        scope: {type: AddressType.Address}
    }
    switch (option.type) {
        case AddressType.Street:
            query.scope!.leastSpecificity = AddressType.Entrance;
            break;
        case AddressType.Entrance:
            query.scope!.entranceAddressId = option.id;
            break;
        case AddressType.Address:
            query.scope!.entranceAddressId = option.accessAddressId;
            break;
    }
    return await search(query);
}


async function search(query: AutocompleteQuery): Promise<Option[]> {
    const urlFactory: AddressApiUrlFactory = createAddressApiUrlFactory();
    const url: URL = urlFactory.getAutocompleteUrl(query);
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