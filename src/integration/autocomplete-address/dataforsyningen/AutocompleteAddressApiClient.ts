import {AutocompleteAddressResponseDto} from "./AutocompleteAddressResponseDto";
import {AutocompleteAddressRequestDto} from "./AutocompleteAddressRequestDto";

export interface AutocompleteAddressApiClient {
    readAutocompleteAddresses(requestDto: AutocompleteAddressRequestDto): Promise<AutocompleteAddressResponseDto[]>
}