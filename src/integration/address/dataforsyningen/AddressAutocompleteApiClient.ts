import {AddressAutocompleteResponseDto} from "./AddressAutocompleteResponseDto";
import {AddressAutocompleteRequestDto} from "./AddressAutocompleteRequestDto";

export interface AddressAutocompleteApiClient {
    readAutocomplete: (requestDto: AddressAutocompleteRequestDto) => Promise<AddressAutocompleteResponseDto[]>
}