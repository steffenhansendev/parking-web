export interface AutocompleteOptionView {
    readonly queryValue: string;
    readonly caretIndexInQueryValue: number;
    readonly viewValue: string;

    isCommittablyComplete(): boolean;

    isEntirelyComplete(): boolean;

    isMatch(value: string): boolean;
}