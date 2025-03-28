import {useState} from "react";
import {getMoreSpecificOptions, getOptions} from "./dataforsyningen";
import {Address} from "../../recommendation/Address";
import {AutocompleteSearchOption, OptionsManager} from "../../components/AutoCompleteSearchBar";
import {AddressSearchOption} from "./AddressSearchOption";

export function createOptionsManager(): OptionsManager<Address> {
    const [options, setOptions] = useState<AddressSearchOption[]>([]);
    const setNextOptions = async (queryValue: string, caretIndexInQueryValue: number): Promise<void> => {
        const nextOptions: AddressSearchOption[] = await getOptions(queryValue, caretIndexInQueryValue);
        setOptions(nextOptions);
    };
    const setNextMoreSpecificOptions = async (option: AutocompleteSearchOption<Address>): Promise<void> => {
        const match: AddressSearchOption | undefined = options.find((o: AddressSearchOption): boolean => o == option);
        if (!match) {
            return;
        }
        const nextOptions: AddressSearchOption[] = await getMoreSpecificOptions(match);
        setOptions(nextOptions);
    }
    return {
        options: options,
        setOptions: setNextOptions,
        setMoreSpecificOptions: setNextMoreSpecificOptions,
    }
}