export interface AutocompleteOption<T> {
    readonly queryValue: string;
    readonly caretIndexInQueryValue: number;
    readonly viewValue: string;
    readonly isCommittable: () => boolean;
    readonly isFurtherSpecifiable: () => boolean;
    readonly isMatch: (query: string) => boolean;
    readonly getResultToCommit: () => T;
}