import {AddressAutocompleteApiClient} from "./dataforsyningen/AddressAutocompleteApiClient";
import {AddressAutocompleteResponseDto} from "./dataforsyningen/AddressAutocompleteResponseDto";
import {AddressAutocompleteAddressTypeDto} from "./dataforsyningen/AddressAutocompleteAddressTypeDto";
import {AddressAutocompleteRequestDto} from "./dataforsyningen/AddressAutocompleteRequestDto";
import {AddressType} from "../../recommendation/AddressType";
import {Address, createAddress} from "../../recommendation/create-address";
import {AutocompleteOptionView} from "../../components/generic/autocomplete-search-bar/AutocompleteOptionView";

export interface AddressAutocompleteOptionServiceResult {
    address: Address[];
    optionView: AutocompleteOptionView[];
}

export interface AddressAutocompleteService {
    getOptions(value: string, caretIndexInValue: number): Promise<Map<AutocompleteOptionView, Address | null>>;

    getMoreSpecificOptions(value: string, caretIndexInValue: number, address: Address): Promise<Map<AutocompleteOptionView, Address | null>>;
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

    async function getOptions(value: string, caretIndexInValue: number): Promise<Map<AutocompleteOptionView, Address | null>> {
        const requestDto: AddressAutocompleteRequestDto =
            {
                value: value,
                caretIndexInValue: caretIndexInValue,
            }
        const addressAutocompleteResponseDtos: AddressAutocompleteResponseDto[] = await _apiClient.readAutocomplete(requestDto);
        return mapToMap(addressAutocompleteResponseDtos);
    }

    async function getMoreSpecificOptions(value: string, caretIndexValue: number, address: Address): Promise<Map<AutocompleteOptionView, Address | null>> {
        const requestDto: AddressAutocompleteRequestDto = mapToRequestDto(value, caretIndexValue, address);
        const addressAutocompleteResponseDtos: AddressAutocompleteResponseDto[] = await _apiClient.readAutocomplete(requestDto);
        return mapToMap(addressAutocompleteResponseDtos);
    }
}

function mapToMap(dtos: AddressAutocompleteResponseDto[]): Map<AutocompleteOptionView, Address | null> {
    return new Map(dtos.map((dto: AddressAutocompleteResponseDto) => {
            const address: Address | null = mapToAddress(dto);
            return [mapToView(dto, address), address]
        }
    ));
}

function mapToAddress(dto: AddressAutocompleteResponseDto): Address | null {
    if (!dto.data.id) {
        return null;
    }
    return createAddress(dto.data.id, mapToAddressType(dto.type), {latitude: dto.data.y, longitude: dto.data.x}, dto.data.adgangsadresseid);
}

function mapToRequestDto(value: string, caretIndexValue: number, address: Address): AddressAutocompleteRequestDto {
    const requestDto: AddressAutocompleteRequestDto = {
        value: value,
        caretIndexInValue: caretIndexValue ?? value.length,
        scope: {type: mapToDataforsyningenAddressType(AddressType.Address)}
    }
    switch (address.type) {
        case AddressType.Street:
            requestDto.scope!.leastSpecificity = mapToDataforsyningenAddressType(AddressType.Entrance);
            break;
        case AddressType.Entrance:
            requestDto.scope!.entranceAddressId = address.id;
            break;
        case AddressType.Address:
            requestDto.scope!.entranceAddressId = address.entranceAddressId!;
            break;
    }
    return requestDto;
}

function mapToView(dto: AddressAutocompleteResponseDto, address: Address | null): AutocompleteOptionView {
    return {
        viewValue: dto.forslagstekst,
        queryValue: dto.tekst,
        caretIndexInQueryValue: dto.caretpos,
        isCommittable(): boolean {
            return (!!address) && (address.type === AddressType.Entrance || address.type === AddressType.Address);
        },
        isMatch(query: string): boolean {
            return query === this.viewValue || query === this.queryValue;
        },
        isFurtherSpecifiable(): boolean {
            return (!!address) && address.type !== AddressType.Address;
        }
    };
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