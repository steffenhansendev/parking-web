import React, {JSX, useRef, useState} from "react";
import AutocompleteSearchBarDropdown from "./AutocompleteSearchBarDropdown";
import {AutocompleteOptionView, AutocompleteQuery} from "./AutocompleteOptionView";
import {AutocompleteOptionViewsManager} from "./AutocompleteOptionViewsManager";

const DIV_ELEMENT_CLASS_NAMES: string[] = ["dropdown", "autocomplete-search-bar-container"];

const INPUT_ELEMENT_VALID_CLASS_NAMES: string[] = ["is-valid"];
const INPUT_ELEMENT_CLASS_NAMES: string [] = ["form-control", "autocomplete-search-bar-input"];

interface Props {
    placeholder: string;
    optionsManager: AutocompleteOptionViewsManager;
    isAutoFocus: boolean;
}

function AutocompleteSearchBar({
                                   placeholder,
                                   optionsManager: {
                                       optionViews,
                                       autocompleteQuery,
                                       autocompleteOption,
                                       stageOption,
                                       stagedOption,
                                       unstageOption,
                                       commitOption
                                   },
                                   isAutoFocus
                               }: Props): JSX.Element {
    const inputElementRef = useRef<HTMLInputElement>(null);
    const [inputElementValue, setInputElementValue] = useState<string>("");
    const [isInputElementInFocus, setIsInputElementInFocus] = useState<boolean>(false);
    const [activeLiElementIndex, setActiveLiElementIndex] = useState(-1);

    const handleValueChanged = async (value: string, selectionStart: number): Promise<void> => {
        setInputElementValue(value);
        const matchingOption: AutocompleteOptionView | undefined = optionViews.find((option: AutocompleteOptionView): boolean => option.isMatch(value));
        if (matchingOption?.isCommittablyComplete()) {
            await chooseOption(matchingOption);
            return;
        }
        await autocompleteQuery({value: value, caretIndex: selectionStart ?? value.length});
        setActiveLiElementIndex(-1);
    };

    const chooseOption = async (choice: AutocompleteOptionView): Promise<void> => {
        setInputElementValue(choice.query.value);
        unstageOption();
        await autocompleteOption(choice);
        setActiveLiElementIndex(-1);
        if (!choice.isCommittablyComplete()) {
            inputElementRef.current?.focus();
            return;
        }
        stageOption(choice);
        if (!choice.isEntirelyComplete()) {
            setInputElementValue(choice.viewValue);
        }
        commitOption();
        inputElementRef.current?.blur();
    };


    const handleInputBlur = async (): Promise<void> => {
        setIsInputElementInFocus(false);
        if (stagedOption) {
            setInputElementValue(stagedOption.viewValue);
            commitOption();
            return;
        }
        if (optionViews[activeLiElementIndex]) {
            await chooseOption(optionViews[activeLiElementIndex]);
            return;
        }
    };

    const handleInputFocus = (): void => {
        setIsInputElementInFocus(true);
        if (!stagedOption) {
            return;
        }
        setQuery(stagedOption.query);
    };

    const setCaret = (index: number): void => {
        setTimeout(() => {
            if (!inputElementRef.current || index < -1) {
                return
            }
            inputElementRef.current.selectionStart = index;
            inputElementRef.current.selectionEnd = index;
        }, 0);
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>): Promise<void> => {
        const length: number = optionViews.length;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault(); // Fixates caret
                if (activeLiElementIndex < length - 1) {
                    const nextActiveLiElementIndex: number = activeLiElementIndex + 1;
                    setActiveLiElementIndex(nextActiveLiElementIndex);
                    const option: AutocompleteOptionView = optionViews[nextActiveLiElementIndex];
                    setQuery(option.query);
                }
                break;
            case "ArrowUp":
                e.preventDefault(); // Fixates caret
                if (activeLiElementIndex > -1) {
                    const nextActiveLiElementIndex: number = activeLiElementIndex - 1;
                    setActiveLiElementIndex(nextActiveLiElementIndex);
                    const option: AutocompleteOptionView = optionViews[nextActiveLiElementIndex];
                    if (!option) {
                        return;
                    }
                    setQuery(option.query);
                }
                break;
            case "Enter":
            case "Tab":
                if (optionViews[activeLiElementIndex]) {
                    await chooseOption(optionViews[activeLiElementIndex]);
                    return;
                }
        }
    };

    const setQuery = (query: AutocompleteQuery): void => {
        setInputElementValue(query.value);
        setCaret(query.caretIndex);
    };

    const isInputMatchingSingleOption: boolean = optionViews.length === 1 && optionViews[0].isMatch(inputElementValue);
    const isDroppedDown: boolean = isInputElementInFocus && optionViews.length > 0 && !isInputMatchingSingleOption;

    const getInputElementClassNames = (): string => {
        let inputElementClassNames: string[] = INPUT_ELEMENT_CLASS_NAMES;
        if (stagedOption) {
            inputElementClassNames = inputElementClassNames.concat(INPUT_ELEMENT_VALID_CLASS_NAMES);
        }
        return inputElementClassNames.join(" ");
    };

    return (
        <form onSubmit={(e: React.FormEvent<HTMLFormElement>): void => {
            e.preventDefault();
        }}>
            <div className={DIV_ELEMENT_CLASS_NAMES.join(" ")}>
                <input
                    ref={inputElementRef}
                    autoFocus={isAutoFocus}
                    type="text"
                    className={getInputElementClassNames()}
                    value={inputElementValue}
                    placeholder={placeholder}
                    onKeyDown={async (e: React.KeyboardEvent<HTMLInputElement>): Promise<void> => {
                        await handleKeyDown(e);
                    }}
                    onChange={async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
                        e.preventDefault();
                        await handleValueChanged(e.target.value, e.target.selectionStart ?? e.target.value.length);
                    }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                />
                {isDroppedDown &&
                    <AutocompleteSearchBarDropdown options={optionViews}
                                                   activeLiElementIndex={activeLiElementIndex}
                                                   chooseOption={chooseOption}/>
                }
            </div>
        </form>
    );
}

export default AutocompleteSearchBar;