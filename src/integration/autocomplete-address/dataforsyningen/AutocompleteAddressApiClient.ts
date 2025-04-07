import {AutocompleteAddressResponseDto} from "./AutocompleteAddressResponseDto";
import {AutocompleteAddressRequestDto} from "./AutocompleteAddressRequestDto";

export interface AutocompleteAddressApiClient {
    readAutocomplete(requestDto: AutocompleteAddressRequestDto): Promise<AutocompleteAddressResponseDto[]>
}