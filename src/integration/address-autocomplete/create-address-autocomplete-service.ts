import {AddressAutocompleteApiClient} from "./dataforsyningen/AddressAutocompleteApiClient";
import {
    AddressAutocompleteEntityTypeDto,
    AddressAutocompleteResponseDto
} from "./dataforsyningen/AddressAutocompleteResponseDto";
import {AddressAutocompleteRequestDto} from "./dataforsyningen/AddressAutocompleteRequestDto";
import {Address, AddressType, createAddress} from "../../recommendation/create-address";
import {AutocompleteOptionView} from "../../components/generic/autocomplete-search-bar/AutocompleteOptionView";

export interface AddressAutocompleteService {
    getOptions(value: string, caretIndexInValue: number): Promise<Map<AutocompleteOptionView, Address | null>>;

    getMoreSpecificOptions(value: string, caretIndexInValue: number, address: Address | null): Promise<Map<AutocompleteOptionView, Address | null>>;
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
    if (!dto.data.id || dto.type === "vejnavn") {
        return null; // Address is an entity; not a value object
    }
    return createAddress(dto.data.id, mapToAddressType(dto.type), {
        latitude: dto.data.y,
        longitude: dto.data.x
    }, dto.data.adgangsadresseid);
}

function mapToRequestDto(value: string, caretIndexValue: number, address: Address): AddressAutocompleteRequestDto {
    const requestDto: AddressAutocompleteRequestDto = {
        value: value,
        caretIndexInValue: caretIndexValue ?? value.length,
        scope: {type: mapToDataforsyningenAddressType(AddressType.Address)}
    }
    if (null === address) {
        requestDto.scope!.leastSpecificity = mapToDataforsyningenAddressType(AddressType.Entrance);
    }
    switch (address?.type) {
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

function mapToAddressType(typeDto: AddressAutocompleteEntityTypeDto): AddressType {
    switch (typeDto) {
        case "adgangsadresse":
            return AddressType.Entrance;
        case "adresse":
            return AddressType.Address;
    }
}

function mapToDataforsyningenAddressType(type: AddressType): AddressAutocompleteEntityTypeDto {
    switch (type) {
        case AddressType.Entrance:
            return "adgangsadresse"
        case AddressType.Address:
            return "adresse";
    }
}