import {AddressAutocompleteResponseDto} from "./AddressAutocompleteResponseDto";
import {AddressAutocompleteRequestDto} from "./AddressAutocompleteRequestDto";

export interface AddressAutocompleteClient {
    httpGetAutocomplete: (request: AddressAutocompleteRequestDto) => Promise<AddressAutocompleteResponseDto[]>
}