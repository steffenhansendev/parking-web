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

const THROTTLE_TIME_IN_MILLISECONDS: number = 50;

export interface AddressManager {
    registerObserver(observerFunction: (address: Address) => void): void;
}

export function useAddress(): AutocompleteOptionViewsManager & AddressManager {
    const service: AddressAutocompleteService = useDi().resolveAddressAutocompleteOptionService();

    const [addressesByAutocompleteOptionView, setAddressesByAutocompleteOptionView] = useState<Map<AutocompleteOptionView, Address | null>>(new Map());
    const stagedAutocompleteOptionView = useRef<AutocompleteOptionView | null>(null);
    const stagedAddress = useRef<Address | null>(null);

    const abortController = useRef<AbortController>(new AbortController());
    let _observerFunction: ((address: Address) => void) | undefined = undefined;

    return {
        optionViews: [...addressesByAutocompleteOptionView.keys()],
        queryOptionViews,
        specifyOptionViews,
        stage,
        unstage,
        staged: stagedAutocompleteOptionView.current ?? null,
        commit,
        registerObserver(observerFunction: (address: Address) => void): void {
            _observerFunction = observerFunction;
        }
    }

    function stage(optionView: AutocompleteOptionView): void {
        const address: Address | null = addressesByAutocompleteOptionView.get(optionView) ?? null;
        if (!address) {
            return;
        }
        stagedAutocompleteOptionView.current = optionView;
        stagedAddress.current = address;
    }

    function unstage(): void {
        stagedAutocompleteOptionView.current = null;
        stagedAddress.current = null;
    }

    function commit(): void {
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
            setAddressesByAutocompleteOptionView(nextAddressesByOptionView);
        }, THROTTLE_TIME_IN_MILLISECONDS);
    }

    async function specifyOptionViews(optionView: AutocompleteOptionView): Promise<void> {
        const address: Address | null = addressesByAutocompleteOptionView.get(optionView) ?? null;
        const nextAddressesByOptionView: Map<AutocompleteOptionView, Address | null> = await service.getMoreSpecificOptions(optionView.queryValue, optionView.caretIndexInQueryValue, address);
        setAddressesByAutocompleteOptionView(nextAddressesByOptionView);
    }
}