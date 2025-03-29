import {useRef, useState} from "react";
import {Address} from "../../recommendation/Address";
import {AutocompleteOption, AutocompleteOptionsManager} from "../../components/AutocompleteSearchBar";
import {
    createAddressAutocompleteOptionProvider
} from "./create-address-autocomplete-option-provider";
import {createAddressAutocompleteClient} from "./dataforsyningen/create-address-autocomplete-client";
import {AddressAutocompleteOptionProvider} from "./AddressAutocompleteOptionProvider";
import {AddressAutocompleteOption} from "./AddressAutocompleteOption";

const PEND_TIME_OF_GET_OPTIONS_IN_MILLISECONDS: number = 50;

export function createAddressAutocompleteOptionsManager(): AutocompleteOptionsManager<Address> {
    const [options, setOptions] = useState<AddressAutocompleteOption[]>([]);
    const abortController = useRef<AbortController>(new AbortController());
    const optionProvider: AddressAutocompleteOptionProvider = createAddressAutocompleteOptionProvider(createAddressAutocompleteClient());
    return {
        options: options,
        setOptions: async (queryValue: string, caretIndexInQueryValue: number): Promise<void> => {
            abortController.current.abort();
            abortController.current = new AbortController();
            const abort: AbortController = abortController.current;
            setTimeout(async (): Promise<void> => {
                if (abort.signal.aborted) {
                    return;
                }
                // When typing, the user will trigger this faster than can be perceived, and getOptions may invoke integrations.
                const nextOptions: AddressAutocompleteOption[] = await optionProvider.getOptions(queryValue, caretIndexInQueryValue);
                setOptions(nextOptions);
            }, PEND_TIME_OF_GET_OPTIONS_IN_MILLISECONDS);
        },
        setMoreSpecificOptions: async (option: AutocompleteOption<Address>): Promise<void> => {
            const match: AddressAutocompleteOption | undefined = options.find((o: AddressAutocompleteOption): boolean => o === option);
            if (!match) {
                return;
            }
            const nextOptions: AddressAutocompleteOption[] = await optionProvider.getMoreSpecificOptions(match);
            setOptions(nextOptions);
        }
    }
}