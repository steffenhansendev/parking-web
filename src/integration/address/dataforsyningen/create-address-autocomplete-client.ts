import {AddressAutocompleteClient} from "./AddressAutocompleteClient";
import {AddressAutocompleteResponseDto} from "./AddressAutocompleteResponseDto";
import {AddressAutocompleteRequestDto} from "./AddressAutocompleteRequestDto";

// @ts-ignore
// Webpack
const HOST: string = ADDRESS_API_HOST;
// @ts-ignore
// Webpack
const URI: string = ADDRESS_API_BASE_URI;
const maxNumberOfResults: number = 10;

export function createAddressAutocompleteClient(): AddressAutocompleteClient {
    return {
        httpGetAutocomplete: async (query: AddressAutocompleteRequestDto): Promise<AddressAutocompleteResponseDto[]> => {
            const url: URL = getAutocompleteUrl(query);
            const response: Response = await fetch(url);
            return (await response.json()) as AddressAutocompleteResponseDto[];
        }
    }
}

function getAutocompleteUrl(query: AddressAutocompleteRequestDto): URL {
    const searchParameters: URLSearchParams = new URLSearchParams({
        "q": query.value,
        "caretpos": query.caretIndexInValue.toString(),
        "fuzzy": "",    // Not documented but always provided as such in Dataforsyningen's own client
        "per_side": maxNumberOfResults.toString()
    });
    query.scope?.type && searchParameters.append("type", query.scope.type)
    query.scope?.entranceAddressId && searchParameters.append("adgangsaddresseid", query.scope.entranceAddressId);
    query.scope?.leastSpecificity && searchParameters.append("startfra", query.scope.leastSpecificity);
    query.scope?.id && searchParameters.append("id", query.scope.id);
    return new URL(`${URI}?${searchParameters.toString()}`, HOST);
}