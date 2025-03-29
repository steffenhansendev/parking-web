import {Coordinates} from "../../recommendation/Inclusion";
import {Address} from "../../recommendation/Address";
import {AddressAutocompleteOption} from "./AddressAutocompleteOption";
import {AddressType} from "./AddressType";

export function createAddressAutocompleteOption(
    viewValue: string,
    queryValue: string,
    caretIndexInQueryValue: number,
    type: AddressType,
    id: string,
    entranceAddressId: string | undefined,
    location: Coordinates
): AddressAutocompleteOption {
    return {
        viewValue: viewValue,
        queryValue: queryValue,
        caretIndexInQueryValue: caretIndexInQueryValue,
        type: type,
        id: id,
        entranceAddressId: entranceAddressId,
        isCommittable: function (): boolean {
            return this.type === AddressType.Entrance
                ||
                this.type === AddressType.Address;
        },
        isMatch: function (query: string): boolean {
            return query.toLowerCase() === this.queryValue.toLowerCase()
                ||
                query.toLowerCase() === this.viewValue.toLowerCase();
        },
        isFurtherSpecifiable: function (): boolean {
            return this.type !== AddressType.Address;
        },
        getResultToCommit: function (): Address {
            return {
                name: this.isFurtherSpecifiable() ? this.viewValue : this.queryValue,
                location: location
            }
        }
    };
}