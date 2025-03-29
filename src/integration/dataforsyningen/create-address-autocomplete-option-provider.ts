import {
    AutocompleteQuery,
    AutocompleteResultDto,
    DataforsyningenAddressType,
    DataforsyningenClient
} from "./create-dataforsyningen-client";

import {
    AddressAutocompleteOption,
    AddressType,
    createAddressAutocompleteOption
} from "./create-address-autocomplete-option";

export interface AddressAutocompleteOptionProvider {
    getOptions: (value: string, caretIndexInValue: number) => Promise<AddressAutocompleteOption[]>;
    getMoreSpecificOptions: (option: AddressAutocompleteOption) => Promise<AddressAutocompleteOption[]>;
}

export function createAddressAutocompleteOptionProvider(dataforsyningenClient: DataforsyningenClient): AddressAutocompleteOptionProvider {
    return {
        getOptions: async (value: string, caretIndexInValue: number): Promise<AddressAutocompleteOption[]> => {
            return await search({
                value: value,
                caretIndexInValue: caretIndexInValue,
            }, dataforsyningenClient);
        },
        getMoreSpecificOptions: async (option: AddressAutocompleteOption): Promise<AddressAutocompleteOption[]> => {
            const query: AutocompleteQuery = {
                value: option.queryValue,
                caretIndexInValue: option.caretIndexInQueryValue ?? option.queryValue.length,
                scope: {type: mapToDataforsyningenAddressType(AddressType.Address)}
            }
            switch (option.type) {
                case AddressType.Street:
                    query.scope!.leastSpecificity = mapToDataforsyningenAddressType(AddressType.Entrance);
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

async function search(query: AutocompleteQuery, client: DataforsyningenClient): Promise<AddressAutocompleteOption[]> {
    const results: AutocompleteResultDto[] = await client.httpGetAutocomplete(query);
    return results.map((dto: AutocompleteResultDto): AddressAutocompleteOption => createAddressAutocompleteOption(dto.forslagstekst, dto.tekst, dto.caretpos, mapToAddressType(dto.type), dto.data.id, dto.data.adgangsadresseid, {
        latitude: dto.data.y,
        longitude: dto.data.x
    }));
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