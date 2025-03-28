import {useState} from "react";
import {getMoreSpecificOptions, getOptions} from "./dataforsyningen";
import {Address} from "../../recommendation/Address";
import {AutocompleteSearchOption, OptionsManager} from "../../components/AutoCompleteSearchBar";
import {AddressAutocompleteSearchOption} from "./AddressAutocompleteSearchOption";

export function createOptionsManager(): OptionsManager<Address> {
    const [options, setOptions] = useState<AddressAutocompleteSearchOption[]>([]);
    const setNextOptions = async (queryValue: string, caretIndexInQueryValue: number): Promise<void> => {
        const nextOptions: AddressAutocompleteSearchOption[] = await getOptions(queryValue, caretIndexInQueryValue);
        setOptions(nextOptions);
    };
    const setNextMoreSpecificOptions = async (option: AutocompleteSearchOption<Address>): Promise<void> => {
        const match: AddressAutocompleteSearchOption | undefined = options.find((o: AddressAutocompleteSearchOption): boolean => o == option);
        if (!match) {
            return;
        }
        const nextOptions: AddressAutocompleteSearchOption[] = await getMoreSpecificOptions(match);
        setOptions(nextOptions);
    }
    return {
        options: options,
        setOptions: setNextOptions,
        setMoreSpecificOptions: setNextMoreSpecificOptions,
    }
}