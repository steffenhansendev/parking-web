import {useRef, useState} from "react";
import {Address} from "./Address";
import {AutocompleteOptionView} from "../components/generic/autocomplete-search-bar/AutocompleteOptionView";
import {
    AutocompleteOptionViewsManager
} from "../components/generic/autocomplete-search-bar/AutocompleteOptionViewsManager";
import {useDi} from "../dependency-injection/DiProvider";
import {AddressAutocompleteOptionView} from "./create-address-autocomplete-option-view";
import {AddressAutocompleteService} from "../integration/address/create-address-autocomplete-service";

const PEND_TIME_OF_GET_OPTIONS_IN_MILLISECONDS: number = 50;

export interface AddressViewManager {
    registerObserver(observerFunction: (address: Address) => void): void;
}

export function useAddress(): AutocompleteOptionViewsManager & AddressViewManager {
    const service: AddressAutocompleteService = useDi().resolveAddressAutocompleteOptionService();
    const [optionViews, setOptionViews] = useState<AddressAutocompleteOptionView[]>([]);
    const stagedOptionView = useRef<AddressAutocompleteOptionView>(undefined);
    const abortController = useRef<AbortController>(new AbortController());
    let _observerFunction: ((address: Address) => void) | undefined = undefined;

    return {
        optionViews: optionViews,
        queryOptionViews,
        specifyOptionViews,
        stagedOptionView,
        commitChoice,
        registerObserver(observerFunction: (address: Address) => void): void {
            _observerFunction = observerFunction;
        }
    }

    async function commitChoice(): Promise<void> {
        if (!stagedOptionView.current) {
            return;
        }
        _observerFunction?.(stagedOptionView.current.asAddress());
    }

    async function queryOptionViews(queryValue: string, caretIndexInQueryValue: number): Promise<void> {
        abortController.current.abort();
        abortController.current = new AbortController();
        const abort: AbortController = abortController.current;
        setTimeout(async (): Promise<void> => {
            if (abort.signal.aborted) {
                return;
            }
            // When typing, the user will trigger this faster than can be perceived, and getOptions may invoke integrations.
            const nextOptions: AddressAutocompleteOptionView[] = await service.getOptions(queryValue, caretIndexInQueryValue);
            setOptionViews(nextOptions);
        }, PEND_TIME_OF_GET_OPTIONS_IN_MILLISECONDS);
    }

    async function specifyOptionViews(option: AutocompleteOptionView): Promise<void> {
        const match: AddressAutocompleteOptionView | undefined = optionViews.find((o: AddressAutocompleteOptionView): boolean => o === option);
        if (!match) {
            return;
        }
        const nextOptions: AddressAutocompleteOptionView[] = await service.getMoreSpecificOptions(match);
        setOptionViews(nextOptions);
    }
}