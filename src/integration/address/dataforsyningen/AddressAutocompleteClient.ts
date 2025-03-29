import {AddressAutocompleteResponseDto} from "./AddressAutocompleteResponseDto";
import {AddressAutocompleteRequestDto} from "./AddressAutocompleteRequestDto";

export interface AddressAutocompleteClient {
    httpGetAutocomplete: (requestDto: AddressAutocompleteRequestDto) => Promise<AddressAutocompleteResponseDto[]>
}