import {AutocompleteAddressApiClient} from "./dataforsyningen/AutocompleteAddressApiClient";
import {
    AutocompleteAddressEntityTypeDto,
    AutocompleteAddressResponseDto
} from "./dataforsyningen/AutocompleteAddressResponseDto";
import {AutocompleteAddressRequestDto} from "./dataforsyningen/AutocompleteAddressRequestDto";
import {Address, AddressType, createAddress} from "../../recommendation/create-address";
import {
    AutocompleteOptionView,
    AutocompleteQuery
} from "../../components/generic/autocomplete-search-bar/AutocompleteOptionView";

export interface AutocompleteAddressService {
    getAddressesByOptionView(query: AutocompleteQuery): Promise<Map<AutocompleteOptionView, Address | null>>;

    getAddressesByOptionViewWithAddress(query: AutocompleteQuery, address: Address | null): Promise<Map<AutocompleteOptionView, Address | null>>;
}

export function createAutocompleteAddressService(apiClient: AutocompleteAddressApiClient): AutocompleteAddressService {
    const _apiClient: AutocompleteAddressApiClient = apiClient;

    return {
        getAddressesByOptionView,
        getAddressesByOptionViewWithAddress
    }

    async function getAddressesByOptionView(query: AutocompleteQuery): Promise<Map<AutocompleteOptionView, Address | null>> {
        const request: AutocompleteAddressRequestDto =
            {
                value: query.value,
                caretIndexInValue: query.caretIndex,
            }
        const response: AutocompleteAddressResponseDto[] = await _apiClient.readAutocompleteAddresses(request);
        return mapToMap(response);
    }

    async function getAddressesByOptionViewWithAddress(query: AutocompleteQuery, address: Address): Promise<Map<AutocompleteOptionView, Address | null>> {
        const request: AutocompleteAddressRequestDto = mapToRequestDto(query, address);
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
        query: {
            value: dto.tekst,
            caretIndex: dto.caretpos,
        },
        viewValue: dto.forslagstekst,
        isMatch(query: string): boolean {
            return query === this.viewValue || query === this.query.value;
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

function mapToRequestDto(query: AutocompleteQuery, address: Address): AutocompleteAddressRequestDto {
    const requestDto: AutocompleteAddressRequestDto = {
        value: query.value,
        caretIndexInValue: query.caretIndex,
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