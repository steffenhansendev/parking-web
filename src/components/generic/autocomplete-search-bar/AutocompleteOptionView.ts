export interface AutocompleteOptionView {
    readonly queryValue: string;
    readonly caretIndexInQueryValue: number;
    readonly viewValue: string;

    isCommittable(): boolean;

    isFurtherSpecifiable(): boolean;

    isMatch(query: string): boolean;
}