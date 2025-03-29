import React, {JSX, useEffect, useRef, useState} from "react";
import AutocompleteSearchBarDropdown from "./AutocompleteSearchBarDropdown";
import {AutocompleteOption} from "./AutocompleteOption";
import {AutocompleteOptionsManager} from "./AutocompleteOptionsManager";

interface Props<T> {
    placeholder: string;
    setResult: (result: T | undefined) => void;
    optionsManager: AutocompleteOptionsManager<T>;
    isInFocus: boolean;
}

const INPUT_ELEMENT_VALID_CLASS: string = "is-valid";

function AutocompleteSearchBar<T>({
                                      placeholder,
                                      setResult,
                                      optionsManager: {options, setOptions, setMoreSpecificOptions},
                                      isInFocus
                                  }: Props<T>): JSX.Element {
    const inputElementRef = useRef<HTMLInputElement>(null);
    const [inputElementValue, setInputElementValue] = useState<string>("");
    const [isInputElementInFocus, setIsInputElementInFocus] = useState<boolean>(false);
    const [activeLiElementIndex, setActiveLiElementIndex] = useState(-1);
    const [isDroppedDown, setIsDroppedDown] = useState<boolean>(false);
    const stagedOption = useRef<AutocompleteOption<T>>(undefined);
    useEffect((): void => {
        setActiveLiElementIndex(-1);
    }, [options]);
    useEffect((): void => {
        const isInputMatchingSingleOption: boolean = (options.length === 1 && options[0].isMatch(inputElementValue));
        setIsDroppedDown(
            isInputElementInFocus && options.length > 0 && !isInputMatchingSingleOption);
    }, [options, inputElementValue, isInputElementInFocus]);
    useEffect((): void => {
        inputElementRef.current?.focus()
    }, [isInFocus]);

    const commit = async () => {
        if (!stagedOption.current) {
            return;
        }
        setResult(stagedOption.current.getCommitResult());
    }

    const handleValueChanged =
        async (value: string, selectionStart: number): Promise<void> => {
            setInputElementValue(value);
            const match: AutocompleteOption<T> | undefined = options.find((option: AutocompleteOption<T>): boolean => option.isMatch(value));
            if (match?.isCommittable()) {
                await choose(match);
                return;
            }
            await setOptions(value, selectionStart ?? value.length);
        };

    const choose = async (choice: AutocompleteOption<T>): Promise<void> => {
        setInputElementValue(choice.queryValue);
        stagedOption.current = undefined;
        await setMoreSpecificOptions(choice);
        if (!choice.isCommittable()) {
            inputElementRef.current?.focus();
            return;
        }

        stagedOption.current = choice;
        if (choice.isFurtherSpecifiable()) {
            setInputElementValue(choice.viewValue);
        }
        await commit();
        inputElementRef.current?.blur();
    }

    const handleInputBlur = async (): Promise<void> => {
        setIsInputElementInFocus(false);
        if (!stagedOption.current) {
            return;
        }
        setInputElementValue(stagedOption.current.viewValue);
        await commit();
    }

    const handleInputFocus = (): void => {
        setIsInputElementInFocus(true);
        if (!stagedOption.current) {
            return;
        }
        setInputElementValue(stagedOption.current.queryValue);
        setCaret(stagedOption.current?.caretIndexInQueryValue);
    }

    const setCaret = (index: number): void => {
        setTimeout(() => {
            if (!inputElementRef.current || index < -1) {
                return
            }
            inputElementRef.current.selectionStart = index;
            inputElementRef.current.selectionEnd = index;
        }, 0);
    }

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>): Promise<void> => {
        const length: number = options.length;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault(); // Fixates caret
                if (activeLiElementIndex < length - 1) {
                    const nextActiveLiElementIndex: number = activeLiElementIndex + 1;
                    setActiveLiElementIndex(nextActiveLiElementIndex);
                    const option: AutocompleteOption<T> = options[nextActiveLiElementIndex];
                    setInputElementValue(option.queryValue);
                    setCaret(option.caretIndexInQueryValue);
                }
                break;
            case "ArrowUp":
                e.preventDefault(); // Fixates caret
                if (activeLiElementIndex > -1) {
                    const nextActiveLiElementIndex: number = activeLiElementIndex - 1;
                    setActiveLiElementIndex(nextActiveLiElementIndex);
                    const option: AutocompleteOption<T> = options[nextActiveLiElementIndex];
                    if (!option) {
                        return;
                    }
                    setInputElementValue(option.queryValue);
                    setCaret(option.caretIndexInQueryValue);
                }
                break;
            case "Enter":
            case "Tab":
                if (options[activeLiElementIndex]) {
                    await choose(options[activeLiElementIndex]);
                    return;
                }
        }
    }

    return (
        <form
            onSubmit={(e: React.FormEvent<HTMLFormElement>): void => {
                e.preventDefault();
            }}
        >
            <div className={"dropdown"}>
                <input
                    ref={inputElementRef}
                    type="text"
                    className={"form-control" + (stagedOption.current ? (" " + INPUT_ELEMENT_VALID_CLASS) : "")}
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
                    onBlur={handleInputBlur}/>
                {isDroppedDown &&
                    <AutocompleteSearchBarDropdown options={options}
                                                   activeLiElementIndex={activeLiElementIndex}
                                                   choose={choose}/>
                }
            </div>
        </form>
    );
}

export default AutocompleteSearchBar;