import {
    createAddressAutocompleteOption
} from "./create-address-autocomplete-option";
import {AddressAutocompleteClient} from "./dataforsyningen/AddressAutocompleteClient";
import {AddressAutocompleteResponseDto} from "./dataforsyningen/AddressAutocompleteResponseDto";
import {AddressAutocompleteAddressTypeDto} from "./dataforsyningen/AddressAutocompleteAddressTypeDto";
import {AddressAutocompleteRequestDto} from "./dataforsyningen/AddressAutocompleteRequestDto";
import {AddressAutocompleteOptionProvider} from "./AddressAutocompleteOptionProvider";
import {AddressAutocompleteOption} from "./AddressAutocompleteOption";
import {AddressType} from "./AddressType";

export function createAddressAutocompleteOptionProvider(dataforsyningenClient: AddressAutocompleteClient): AddressAutocompleteOptionProvider {
    return {
        getOptions: async (value: string, caretIndexInValue: number): Promise<AddressAutocompleteOption[]> => {
            return await search({
                value: value,
                caretIndexInValue: caretIndexInValue,
            }, dataforsyningenClient);
        },
        getMoreSpecificOptions: async (option: AddressAutocompleteOption): Promise<AddressAutocompleteOption[]> => {
            const query: AddressAutocompleteRequestDto = {
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

async function search(query: AddressAutocompleteRequestDto, client: AddressAutocompleteClient): Promise<AddressAutocompleteOption[]> {
    const results: AddressAutocompleteResponseDto[] = await client.httpGetAutocomplete(query);
    return results.map((dto: AddressAutocompleteResponseDto): AddressAutocompleteOption => createAddressAutocompleteOption(dto.forslagstekst, dto.tekst, dto.caretpos, mapToAddressType(dto.type), dto.data.id, dto.data.adgangsadresseid, {
        latitude: dto.data.y,
        longitude: dto.data.x
    }));
}

function mapToAddressType(type: AddressAutocompleteAddressTypeDto): AddressType {
    switch (type) {
        case "vejnavn":
            return AddressType.Street;
        case "adgangsadresse":
            return AddressType.Entrance;
        case "adresse":
            return AddressType.Address;
    }
}

function mapToDataforsyningenAddressType(type: AddressType): AddressAutocompleteAddressTypeDto {
    switch (type) {
        case AddressType.Street:
            return "vejnavn";
        case AddressType.Entrance:
            return "adgangsadresse"
        case AddressType.Address:
            return "adresse";
    }
}