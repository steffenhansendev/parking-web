import {AddressApiUrlFactory, AutocompleteQuery} from "./AddressApiUrlFactory";
import {AddressType} from "./Option";
import {DataforsyningenAddressType} from "./AutocompleteDto";

export function createAddressApiUrlFactory(): AddressApiUrlFactory {
    const HOST: string = "https://api.dataforsyningen.dk";
    const URI: string = "autocomplete";
    const maxNumberOfResults: number = 10;
    return {
        getAutocompleteUrl: function (query: AutocompleteQuery):
            URL {
            const searchParameters: URLSearchParams = new URLSearchParams({
                "q": query.value,
                "caretpos": query.caretIndexInValue.toString(),
                "fuzzy": "",    // Not documented but always provided as such in Dataforsyningen's own client
                "per_side": maxNumberOfResults.toString()
            });
            query.scope?.type && searchParameters.append("type",
                mapToDataforsyningenAddressType(query.scope.type))
            query.scope?.entranceAddressId && searchParameters.append("adgangsaddresseid",
                query.scope.entranceAddressId);
            query.scope?.leastSpecificity && searchParameters.append("startfra",
                mapToDataforsyningenAddressType(query.scope.leastSpecificity))
            query.scope?.id && searchParameters.append("id",
                query.scope.id);
            return new URL(`${URI}?${searchParameters.toString()}`, HOST);
        }
    }
}

function mapToDataforsyningenAddressType(type: AddressType | undefined): DataforsyningenAddressType {
    switch (type) {
        case AddressType.Street:
            return "vejnavn";
        case AddressType.Entrance:
            return "adgangsadresse"
        case AddressType.Address:
        case undefined:
            return "adresse";
    }
}