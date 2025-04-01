import {Address} from "./Address";
import {AddressType} from "./AddressType";
import {Coordinates} from "./Coordinates";
import {AutocompleteOptionView} from "../components/generic/autocomplete-search-bar/AutocompleteOptionView";

export interface AddressAutocompleteOptionView extends AutocompleteOptionView {
    readonly type: AddressType;
    readonly id: string;
    readonly entranceAddressId?: string; // Only for type = Address
    asAddress(): Address; // Strictly speaking, this is not a view object due to returning as domain object
}

export function createAddressAutocompleteOptionView(
    viewValue: string,
    queryValue: string,
    caretIndexInQueryValue: number,
    //
    type: AddressType,
    id: string,
    entranceAddressId: string | undefined,
    location: Coordinates,
): AddressAutocompleteOptionView {
    return {
        viewValue: viewValue,
        queryValue: queryValue,
        caretIndexInQueryValue: caretIndexInQueryValue,
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
        asAddress: function (): Address {
            return {
                name: this.isFurtherSpecifiable() ? this.viewValue : this.queryValue,
                location: location
            }
        },
        //
        type: type,
        id: id,
        entranceAddressId: entranceAddressId,
    };
}