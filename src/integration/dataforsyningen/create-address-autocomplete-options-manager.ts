import {useState} from "react";
import {Address} from "../../recommendation/Address";
import {AutocompleteOption, AutocompleteOptionsManager} from "../../components/AutocompleteSearchBar";
import {
    AddressAutocompleteOptionProvider,
    createAddressAutocompleteOptionProvider
} from "./create-address-autocomplete-option-provider";
import {createDataforsyningenClient} from "./create-dataforsyningen-client";

export function createAddressAutocompleteOptionsManager(): AutocompleteOptionsManager<Address> {
    const [options, setOptions] = useState<AddressAutocompleteOption[]>([]);
    const optionProvider: AddressAutocompleteOptionProvider = createAddressAutocompleteOptionProvider(createDataforsyningenClient());
    return {
        options: options,
        setOptions: async (queryValue: string, caretIndexInQueryValue: number): Promise<void> => {
            const nextOptions: AddressAutocompleteOption[] = await optionProvider.getOptions(queryValue, caretIndexInQueryValue);
            setOptions(nextOptions);
        },
        setMoreSpecificOptions: async (option: AutocompleteOption<Address>): Promise<void> => {
            const match: AddressAutocompleteOption | undefined = options.find((o: AddressAutocompleteOption): boolean => o == option);
            if (!match) {
                return;
            }
            const nextOptions: AddressAutocompleteOption[] = await optionProvider.getMoreSpecificOptions(match);
            setOptions(nextOptions);
        }
    }
}

export interface AddressAutocompleteOption extends AutocompleteOption<Address> {
    type: AddressType;
    id: string;
    entranceAddressId?: string; // Only for type = Address
}

export enum AddressType {
    Street,
    Entrance,
    Address
}