import {
    AddressAutocompleteOptionView,
    createAddressAutocompleteOptionView
} from "../../recommendation/create-address-autocomplete-option-view";
import {AddressAutocompleteApiClient} from "./dataforsyningen/AddressAutocompleteApiClient";
import {AddressAutocompleteResponseDto} from "./dataforsyningen/AddressAutocompleteResponseDto";
import {AddressAutocompleteAddressTypeDto} from "./dataforsyningen/AddressAutocompleteAddressTypeDto";
import {AddressAutocompleteRequestDto} from "./dataforsyningen/AddressAutocompleteRequestDto";
import {AddressType} from "../../recommendation/AddressType";

export interface AddressAutocompleteService {
    getOptions(value: string, caretIndexInValue: number): Promise<AddressAutocompleteOptionView[]>;

    getMoreSpecificOptions(option: AddressAutocompleteOptionView): Promise<AddressAutocompleteOptionView[]>;
}

/*
This maps directly between DTOs and view objects since encapsulating domain logic in pertaining objects is unnecessary.
 */
export function createAddressAutocompleteService(apiClient: AddressAutocompleteApiClient): AddressAutocompleteService {
    const _apiClient: AddressAutocompleteApiClient = apiClient;

    return {
        getOptions,
        getMoreSpecificOptions
    }

    async function getOptions(value: string, caretIndexInValue: number): Promise<AddressAutocompleteOptionView[]> {
        const requestDto: AddressAutocompleteRequestDto =
            {
                value: value,
                caretIndexInValue: caretIndexInValue,
            }
        const addressAutocompleteResponseDtos: AddressAutocompleteResponseDto[] = await _apiClient.readAutocomplete(requestDto);
        return addressAutocompleteResponseDtos.map((dto: AddressAutocompleteResponseDto): AddressAutocompleteOptionView => mapToView(dto));
    }

    async function getMoreSpecificOptions(option: AddressAutocompleteOptionView): Promise<AddressAutocompleteOptionView[]> {
        const requestDto: AddressAutocompleteRequestDto = mapToRequestDto(option);
        const addressAutocompleteResponseDtos: AddressAutocompleteResponseDto[] = await _apiClient.readAutocomplete(requestDto);
        return addressAutocompleteResponseDtos.map((dto: AddressAutocompleteResponseDto): AddressAutocompleteOptionView => mapToView(dto));
    }
}

function mapToRequestDto(option: AddressAutocompleteOptionView): AddressAutocompleteRequestDto {
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
    return requestDto;
}

function mapToView(responseDto: AddressAutocompleteResponseDto): AddressAutocompleteOptionView {
    return createAddressAutocompleteOptionView(
        responseDto.forslagstekst,
        responseDto.tekst,
        responseDto.caretpos,
        mapToAddressType(responseDto.type),
        responseDto.data.id,
        responseDto.data.adgangsadresseid, {
            latitude: responseDto.data.y,
            longitude: responseDto.data.x
        }
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