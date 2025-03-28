import {useState} from "react";
import {Address} from "../../recommendation/Address";
import {AutocompleteSearchOption, OptionsManager} from "../../components/AutoCompleteSearchBar";
import {
    AddressAutocompleteOptionProvider,
    createAddressAutocompleteOptionProvider
} from "./create-address-autocomplete-option-provider";

export interface AddressAutocompleteSearchOption extends AutocompleteSearchOption<Address> {
    type: AddressType;
    id: string;
    entranceAddressId?: string; // Only for type = Address
}

export enum AddressType {
    Street,
    Entrance,
    Address
}

export function createAddressOptionsManager(): OptionsManager<Address> {
    const [options, setOptions] = useState<AddressAutocompleteSearchOption[]>([]);
    const optionProvider: AddressAutocompleteOptionProvider = createAddressAutocompleteOptionProvider();
    const setNextOptions = async (queryValue: string, caretIndexInQueryValue: number): Promise<void> => {
        const nextOptions: AddressAutocompleteSearchOption[] = await optionProvider.getOptions(queryValue, caretIndexInQueryValue);
        setOptions(nextOptions);
    };
    const setNextMoreSpecificOptions = async (option: AutocompleteSearchOption<Address>): Promise<void> => {
        const match: AddressAutocompleteSearchOption | undefined = options.find((o: AddressAutocompleteSearchOption): boolean => o == option);
        if (!match) {
            return;
        }
        const nextOptions: AddressAutocompleteSearchOption[] = await optionProvider.getMoreSpecificOptions(match);
        setOptions(nextOptions);
    }
    return {
        options: options,
        setOptions: setNextOptions,
        setMoreSpecificOptions: setNextMoreSpecificOptions,
    }
}