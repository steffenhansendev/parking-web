import {AddressAutocompleteApiClient} from "./AddressAutocompleteApiClient";
import {AddressAutocompleteResponseDto} from "./AddressAutocompleteResponseDto";
import {AddressAutocompleteRequestDto} from "./AddressAutocompleteRequestDto";

// @ts-ignore
// Webpack
const HOST: string = ADDRESS_API_HOST;
// @ts-ignore
// Webpack
const URI: string = ADDRESS_API_BASE_URI;
const maxResultCount: number = 10;

export function createAddressAutocompleteApiClient(): AddressAutocompleteApiClient {
    return {
        async readAutocomplete (requestDto: AddressAutocompleteRequestDto): Promise<AddressAutocompleteResponseDto[]> {
            const url: URL = createAutocompleteUrl(requestDto);
            const response: Response = await fetch(url);
            return (await response.json()) as AddressAutocompleteResponseDto[];
        }
    }
}

function createAutocompleteUrl(requestDto: AddressAutocompleteRequestDto): URL {
    const searchParameters: URLSearchParams = new URLSearchParams({
        "q": requestDto.value,
        "caretpos": requestDto.caretIndexInValue.toString(),
        "fuzzy": "",    // Not documented but always provided as such in Dataforsyningen's own client
        "per_side": maxResultCount.toString()
    });
    requestDto.scope?.type && searchParameters.append("type", requestDto.scope.type)
    requestDto.scope?.entranceAddressId && searchParameters.append("adgangsaddresseid", requestDto.scope.entranceAddressId);
    requestDto.scope?.leastSpecificity && searchParameters.append("startfra", requestDto.scope.leastSpecificity);
    requestDto.scope?.id && searchParameters.append("id", requestDto.scope.id);
    return new URL(`${URI}?${searchParameters.toString()}`, HOST);
}