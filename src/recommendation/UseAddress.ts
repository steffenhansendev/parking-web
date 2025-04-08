import {useRef, useState} from "react";
import {Address} from "./create-address";
import {
    AutocompleteOptionView,
    AutocompleteQuery
} from "../components/generic/autocomplete-search-bar/AutocompleteOptionView";
import {
    AutocompleteOptionViewsManager
} from "../components/generic/autocomplete-search-bar/AutocompleteOptionViewsManager";
import {useDi} from "../dependency-injection/DiProvider";
import {
    AutocompleteAddressService
} from "../integration/autocomplete-address/create-autocomplete-address-service";

const THROTTLE_TIME_IN_MILLISECONDS: number = 50;

export interface AddressManager {
    registerObserver(observerFunction: (address: Address) => void): void;
}

export function useAddress(): AutocompleteOptionViewsManager & AddressManager {
    const service: AutocompleteAddressService = useDi().resolveAddressAutocompleteOptionService();

    const [addressesByAutocompleteOptionView, setAddressesByAutocompleteOptionView] = useState<Map<AutocompleteOptionView, Address | null>>(new Map());
    const stagedAutocompleteOptionView = useRef<AutocompleteOptionView | null>(null);
    const stagedAddress = useRef<Address | null>(null);

    const abortController = useRef<AbortController>(new AbortController());
    let _observerFunction: ((address: Address) => void) | undefined = undefined;

    return {
        optionViews: [...addressesByAutocompleteOptionView.keys()],
        autocompleteQuery,
        autocompleteOption,
        stageOption,
        unstageOption,
        stagedOption: stagedAutocompleteOptionView.current ?? null,
        commitOption,
        registerObserver(observerFunction: (address: Address) => void): void {
            _observerFunction = observerFunction;
        }
    }

    function stageOption(optionView: AutocompleteOptionView): void {
        const address: Address | null = addressesByAutocompleteOptionView.get(optionView) ?? null;
        if (!address) {
            return;
        }
        stagedAutocompleteOptionView.current = optionView;
        stagedAddress.current = address;
    }

    function unstageOption(): void {
        stagedAutocompleteOptionView.current = null;
        stagedAddress.current = null;
    }

    function commitOption(): void {
        if (!stagedAddress.current) {
            return;
        }
        _observerFunction?.(stagedAddress.current);
    }

    async function autocompleteQuery(query: AutocompleteQuery): Promise<void> {
        abortController.current.abort();
        abortController.current = new AbortController();
        const abort: AbortController = abortController.current;
        setTimeout(async (): Promise<void> => {
            if (abort.signal.aborted) {
                return;
            }
            // When typing, the user will trigger this faster than can be perceived, and getOptions may invoke integrations.
            const nextAddressesByOptionView: Map<AutocompleteOptionView, Address | null> = await service.autocompleteValue(query);
            setAddressesByAutocompleteOptionView(nextAddressesByOptionView);
        }, THROTTLE_TIME_IN_MILLISECONDS);
    }

    async function autocompleteOption(optionView: AutocompleteOptionView): Promise<void> {
        const address: Address | null = addressesByAutocompleteOptionView.get(optionView) ?? null;
        const nextAddressesByOptionView: Map<AutocompleteOptionView, Address | null> = await service.autocompleteOption(optionView.query, address);
        setAddressesByAutocompleteOptionView(nextAddressesByOptionView);
    }
}