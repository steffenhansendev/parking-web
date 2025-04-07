import React, {JSX, useRef, useState} from "react";
import AutocompleteSearchBarDropdown from "./AutocompleteSearchBarDropdown";
import {AutocompleteOptionView} from "./AutocompleteOptionView";
import {AutocompleteOptionViewsManager} from "./AutocompleteOptionViewsManager";

const INPUT_ELEMENT_VALID_CLASS: string = "is-valid";

interface Props {
    placeholder: string;
    optionsManager: AutocompleteOptionViewsManager;
    isInFocus: boolean;
}

function AutocompleteSearchBar({
                                   placeholder,
                                   optionsManager: {
                                       optionViews,
                                       queryOptionViews,
                                       specifyOptionViews,
                                       stage,
                                       staged,
                                       unstage,
                                       commit
                                   },
                                   isInFocus
                               }: Props): JSX.Element {
    const inputElementRef = useRef<HTMLInputElement>(null);
    const [inputElementValue, setInputElementValue] = useState<string>("");
    const [isInputElementInFocus, setIsInputElementInFocus] = useState<boolean>(false);
    const [activeLiElementIndex, setActiveLiElementIndex] = useState(-1);

    const isInputMatchingSingleOption: boolean = optionViews.length === 1 && optionViews[0].isMatch(inputElementValue);
    const isDroppedDown: boolean = isInputElementInFocus && optionViews.length > 0 && !isInputMatchingSingleOption;

    const handleValueChanged =
        async (value: string, selectionStart: number): Promise<void> => {
            setInputElementValue(value);
            const match: AutocompleteOptionView | undefined = optionViews.find((option: AutocompleteOptionView): boolean => option.isMatch(value));
            if (match?.isCommittable()) {
                await choose(match);
                return;
            }
            await queryOptionViews(value, selectionStart ?? value.length);
            setActiveLiElementIndex(-1);
        };

    const choose = async (choice: AutocompleteOptionView): Promise<void> => {
        setInputElementValue(choice.queryValue);
        unstage();
        await specifyOptionViews(choice);
        setActiveLiElementIndex(-1);
        if (!choice.isCommittable()) {
            inputElementRef.current?.focus();
            return;
        }
        stage(choice);
        if (choice.isFurtherSpecifiable()) {
            setInputElementValue(choice.viewValue);
        }
        commit();
        inputElementRef.current?.blur();
    }


    const handleInputBlur = async (): Promise<void> => {
        setIsInputElementInFocus(false);
        if (!staged) {
            return;
        }
        setInputElementValue(staged.viewValue);
        commit();
    }

    const handleInputFocus = (): void => {
        setIsInputElementInFocus(true);
        if (!staged) {
            return;
        }
        setInputElementValue(staged.queryValue);
        setCaret(staged.caretIndexInQueryValue);
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
        const length: number = optionViews.length;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault(); // Fixates caret
                if (activeLiElementIndex < length - 1) {
                    const nextActiveLiElementIndex: number = activeLiElementIndex + 1;
                    setActiveLiElementIndex(nextActiveLiElementIndex);
                    const option: AutocompleteOptionView = optionViews[nextActiveLiElementIndex];
                    setInputElementValue(option.queryValue);
                    setCaret(option.caretIndexInQueryValue);
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
                    setInputElementValue(option.queryValue);
                    setCaret(option.caretIndexInQueryValue);
                }
                break;
            case "Enter":
            case "Tab":
                if (optionViews[activeLiElementIndex]) {
                    await choose(optionViews[activeLiElementIndex]);
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
                    autoFocus={isInFocus}
                    type="text"
                    className={"form-control" + (!!staged ? (" " + INPUT_ELEMENT_VALID_CLASS) : "")}
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
                    <AutocompleteSearchBarDropdown options={optionViews}
                                                   activeLiElementIndex={activeLiElementIndex}
                                                   choose={choose}/>
                }
            </div>
        </form>
    );
}

export default AutocompleteSearchBar;