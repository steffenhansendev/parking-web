import {AutocompleteAddressApiClient} from "./dataforsyningen/AutocompleteAddressApiClient";
import {
    AutocompleteAddressEntityTypeDto,
    AutocompleteAddressResponseDto
} from "./dataforsyningen/AutocompleteAddressResponseDto";
import {AutocompleteAddressRequestDto} from "./dataforsyningen/AutocompleteAddressRequestDto";
import {Address, AddressType, createAddress} from "../../recommendation/create-address";
import {AutocompleteOptionView} from "../../components/generic/autocomplete-search-bar/AutocompleteOptionView";

export interface AutocompleteAddressService {
    autocompleteValue(value: string, caretIndexInValue: number): Promise<Map<AutocompleteOptionView, Address | null>>;

    autocompleteOption(value: string, caretIndexInValue: number, address: Address | null): Promise<Map<AutocompleteOptionView, Address | null>>;
}

export function createAutocompleteAddressService(apiClient: AutocompleteAddressApiClient): AutocompleteAddressService {
    const _apiClient: AutocompleteAddressApiClient = apiClient;

    return {
        autocompleteValue: getOptions,
        autocompleteOption: getMoreSpecificOptions
    }

    async function getOptions(value: string, caretIndexInValue: number): Promise<Map<AutocompleteOptionView, Address | null>> {
        const request: AutocompleteAddressRequestDto =
            {
                value: value,
                caretIndexInValue: caretIndexInValue,
            }
        const response: AutocompleteAddressResponseDto[] = await _apiClient.readAutocompleteAddresses(request);
        return mapToMap(response);
    }

    async function getMoreSpecificOptions(value: string, caretIndexValue: number, address: Address): Promise<Map<AutocompleteOptionView, Address | null>> {
        const request: AutocompleteAddressRequestDto = mapToRequestDto(value, caretIndexValue, address);
        const response: AutocompleteAddressResponseDto[] = await _apiClient.readAutocompleteAddresses(request);
        return mapToMap(response);
    }
}

function mapToMap(dtos: AutocompleteAddressResponseDto[]): Map<AutocompleteOptionView, Address | null> {
    return new Map(dtos.map((dto: AutocompleteAddressResponseDto) => {
            const address: Address | null = mapToAddress(dto);
            return [mapToView(dto, address), address]
        }
    ));
}

function mapToAddress(dto: AutocompleteAddressResponseDto): Address | null {
    if (!dto.data.id || dto.type === "vejnavn") {
        return null; // Address is an entity; not a value object
    }
    return createAddress(dto.data.id, mapToAddressType(dto.type), {
        latitude: dto.data.y,
        longitude: dto.data.x
    }, dto.data.adgangsadresseid);
}

function mapToView(dto: AutocompleteAddressResponseDto, address: Address | null): AutocompleteOptionView {
    return {
        viewValue: dto.forslagstekst,
        queryValue: dto.tekst,
        caretIndexInQueryValue: dto.caretpos,
        isMatch(query: string): boolean {
            return query === this.viewValue || query === this.queryValue;
        },
        isCommittablyComplete(): boolean {
            return (!!address) && (address.type === AddressType.Entrance || address.type === AddressType.Address);
        },
        isEntirelyComplete(): boolean {
            return (!!address) && address.type === AddressType.Address;
        }
    };
}

function mapToAddressType(typeDto: AutocompleteAddressEntityTypeDto): AddressType {
    switch (typeDto) {
        case "adgangsadresse":
            return AddressType.Entrance;
        case "adresse":
            return AddressType.Address;
    }
}

function mapToRequestDto(value: string, caretIndexValue: number, address: Address): AutocompleteAddressRequestDto {
    const requestDto: AutocompleteAddressRequestDto = {
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

function mapToDataforsyningenAddressType(type: AddressType): AutocompleteAddressEntityTypeDto {
    switch (type) {
        case AddressType.Entrance:
            return "adgangsadresse"
        case AddressType.Address:
            return "adresse";
    }
}