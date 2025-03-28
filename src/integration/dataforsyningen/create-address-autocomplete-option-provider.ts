import {Address} from "../../recommendation/Address";
import {
    AutocompleteQuery,
    AutoCompleteResultDto,
    createDataforsyningenClient,
    DataforsyningenAddressType, DataForsyningenClient
} from "./create-dataforsyningen-client";
import {AddressAutocompleteSearchOption, AddressType} from "./create-address-options-manager";

export interface AddressAutocompleteOptionProvider {
    getOptions: (value: string, caretIndexInValue: number) => Promise<AddressAutocompleteSearchOption[]>;
    getMoreSpecificOptions: (option: AddressAutocompleteSearchOption) => Promise<AddressAutocompleteSearchOption[]>;
}

export function createAddressAutocompleteOptionProvider(dataforsyningenClient: DataForsyningenClient): AddressAutocompleteOptionProvider {

    return {
        getOptions: async (value: string, caretIndexInValue: number): Promise<AddressAutocompleteSearchOption[]> => {
            return await search({
                value: value,
                caretIndexInValue: caretIndexInValue,
            }, dataforsyningenClient);
        },
        getMoreSpecificOptions: async (option: AddressAutocompleteSearchOption): Promise<AddressAutocompleteSearchOption[]> => {
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
                    query.scope!.entranceAddressId = option.entranceAddressId;
                    break;
            }
            return await search(query, dataforsyningenClient);
        }
    }
}

async function search(query: AutocompleteQuery, client: DataForsyningenClient): Promise<AddressAutocompleteSearchOption[]> {
    const results: AutoCompleteResultDto[] = await client.httpGetAutocomplete(query);
    return results.map((dto: AutoCompleteResultDto): AddressAutocompleteSearchOption => mapToAutocompleteSearchOption(dto));
}

function mapToAutocompleteSearchOption(dto: AutoCompleteResultDto): AddressAutocompleteSearchOption {
    return {
        viewValue: dto.forslagstekst,
        queryValue: dto.tekst,
        caretIndexInQueryValue: dto.caretpos,
        type: mapToAddressType(dto.type),
        id: dto.data.id,
        entranceAddressId: dto.data.adgangsadresseid,
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