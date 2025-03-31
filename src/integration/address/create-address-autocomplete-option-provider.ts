import {
    createAddressAutocompleteOption
} from "./create-address-autocomplete-option";
import {AddressAutocompleteApiClient} from "./dataforsyningen/AddressAutocompleteApiClient";
import {AddressAutocompleteResponseDto} from "./dataforsyningen/AddressAutocompleteResponseDto";
import {AddressAutocompleteAddressTypeDto} from "./dataforsyningen/AddressAutocompleteAddressTypeDto";
import {AddressAutocompleteRequestDto} from "./dataforsyningen/AddressAutocompleteRequestDto";
import {AddressAutocompleteOptionProvider} from "./AddressAutocompleteOptionProvider";
import {AddressAutocompleteOption} from "./AddressAutocompleteOption";
import {AddressType} from "./AddressType";
import {useDi} from "../../dependency-injection/DiProvider";

export function createAddressAutocompleteOptionProvider(): AddressAutocompleteOptionProvider {
    const apiClient: AddressAutocompleteApiClient = useDi().resolveAddressAutocompleteApiClient();
    return {
        getOptions: async (value: string, caretIndexInValue: number): Promise<AddressAutocompleteOption[]> => {
            return await search({
                value: value,
                caretIndexInValue: caretIndexInValue,
            }, apiClient);
        },
        getMoreSpecificOptions: async (option: AddressAutocompleteOption): Promise<AddressAutocompleteOption[]> => {
            const requestDto: AddressAutocompleteRequestDto = {
                value: option.queryValue,
                caretIndexInValue: option.caretIndexInQueryValue ?? option.queryValue.length,
                scope: {type: mapToDataforsyningenAddressType(AddressType.Address)}
            }
            switch (option.type) {
                case AddressType.Street:
                    requestDto.scope!.leastSpecificity = mapToDataforsyningenAddressType(AddressType.Entrance);
                    break;
                case AddressType.Entrance:
                    requestDto.scope!.entranceAddressId = option.id;
                    break;
                case AddressType.Address:
                    requestDto.scope!.entranceAddressId = option.entranceAddressId;
                    break;
            }
            return await search(requestDto, apiClient);
        }
    }
}

async function search(requestDto: AddressAutocompleteRequestDto, client: AddressAutocompleteApiClient): Promise<AddressAutocompleteOption[]> {
    const results: AddressAutocompleteResponseDto[] = await client.readAutocomplete(requestDto);
    return results.map((responseDto: AddressAutocompleteResponseDto): AddressAutocompleteOption => createAddressAutocompleteOption(
        responseDto.forslagstekst,
        responseDto.tekst,
        responseDto.caretpos,
        mapToAddressType(responseDto.type),
        responseDto.data.id,
        responseDto.data.adgangsadresseid, {
            latitude: responseDto.data.y,
            longitude: responseDto.data.x
        })
    );
}

function mapToAddressType(typeDto: AddressAutocompleteAddressTypeDto): AddressType {
    switch (typeDto) {
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