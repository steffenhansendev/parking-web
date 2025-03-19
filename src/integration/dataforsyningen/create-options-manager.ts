import {useState} from "react";
import {getMoreSpecificOptions, getOptions} from "./dataforsyningen";
import {Address} from "../../recommendation/Address";
import {AutocompleteSearchOption, OptionsManager} from "../../components/AutoCompleteSearchBar";
import {Option} from "./Option";

export function createOptionsManager(): OptionsManager<Address> {
    const [options, setOptions] = useState<Option[]>([]);
    const setNextOptions = async (queryValue: string, caretIndexInQueryValue: number): Promise<void> => {
        const nextOptions: Option[] = await getOptions(queryValue, caretIndexInQueryValue);
        setOptions(nextOptions);
    };
    const setNextMoreSpecificOptions = async (option: AutocompleteSearchOption<Address>): Promise<void> => {
        const match: Option | undefined = options.find((o: Option): boolean => o == option);
        if (!match) {
            return;
        }
        const nextOptions: Option[] = await getMoreSpecificOptions(match);
        setOptions(nextOptions);
    }
    return {
        options: options,
        setOptions: setNextOptions,
        setMoreSpecificOptions: setNextMoreSpecificOptions,
    }
}