export interface AutocompleteOptionView {
    readonly query: AutocompleteQuery;
    readonly viewValue: string;

    isCommittablyComplete(): boolean;

    isEntirelyComplete(): boolean;

    isMatch(value: string): boolean;
}


export interface AutocompleteQuery {
    readonly value: string;
    readonly caretIndex: number;
}