import {useRef, useState} from "react";
import {Address} from "./create-address";
import {AutocompleteOptionView} from "../components/generic/autocomplete-search-bar/AutocompleteOptionView";
import {
    AutocompleteOptionViewsManager
} from "../components/generic/autocomplete-search-bar/AutocompleteOptionViewsManager";
import {useDi} from "../dependency-injection/DiProvider";
import {
    AddressAutocompleteService
} from "../integration/address/create-address-autocomplete-service";

const PEND_TIME_OF_GET_OPTIONS_IN_MILLISECONDS: number = 50;

export interface AddressViewManager {
    registerObserver(observerFunction: (address: Address) => void): void;
}

export function useAddress(): AutocompleteOptionViewsManager & AddressViewManager {
    const service: AddressAutocompleteService = useDi().resolveAddressAutocompleteOptionService();

    const [addressesByOptionView, setAddressesByOptionView] = useState<Map<AutocompleteOptionView, Address | null>>(new Map());
    const stagedOptionView = useRef<AutocompleteOptionView | null>(null);
    const stagedAddress = useRef<Address | null>(null);

    const abortController = useRef<AbortController>(new AbortController());
    let _observerFunction: ((address: Address) => void) | undefined = undefined;

    return {
        optionViews: [...addressesByOptionView.keys()],
        queryOptionViews,
        specifyOptionViews,
        stage,
        unstage,
        staged: stagedOptionView.current ?? null,
        commit: commit,
        registerObserver(observerFunction: (address: Address) => void): void {
            _observerFunction = observerFunction;
        }
    }

    function stage(optionView: AutocompleteOptionView): void {
        const address = addressesByOptionView.get(optionView);
        if (!address) {
            return;
        }
        stagedOptionView.current = optionView;
        stagedAddress.current = address;
    }

    function unstage(): void {
        stagedOptionView.current = null;
        stagedAddress.current = null;
    }

    async function commit(): Promise<void> {
        if (!stagedAddress.current) {
            return;
        }
        _observerFunction?.(stagedAddress.current);
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
            const nextAddressesByOptionView: Map<AutocompleteOptionView, Address | null> = await service.getOptions(queryValue, caretIndexInQueryValue);
            setAddressesByOptionView(nextAddressesByOptionView);
        }, PEND_TIME_OF_GET_OPTIONS_IN_MILLISECONDS);
    }

    async function specifyOptionViews(optionView: AutocompleteOptionView): Promise<void> {
        const address = addressesByOptionView.get(optionView) ?? null;
        const nextAddressesByOptionView: Map<AutocompleteOptionView, Address | null> = await service.getMoreSpecificOptions(optionView.queryValue, optionView.caretIndexInQueryValue, address);
        setAddressesByOptionView(nextAddressesByOptionView);
    }
}