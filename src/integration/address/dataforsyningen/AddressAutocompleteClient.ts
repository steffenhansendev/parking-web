import {AddressAutocompleteResponseDto} from "./AddressAutocompleteResponseDto";
import {AddressAutocompleteRequestDto} from "./AddressAutocompleteRequestDto";

export interface AddressAutocompleteClient {
    httpGetAutocomplete: (query: AddressAutocompleteRequestDto) => Promise<AddressAutocompleteResponseDto[]>
}