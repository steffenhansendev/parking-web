export interface AutocompleteOption<T> {
    queryValue: string;
    caretIndexInQueryValue: number;
    viewValue: string;
    isCommittable: () => boolean;
    isFurtherSpecifiable: () => boolean;
    isMatch: (query: string) => boolean;
    getResultToCommit: () => T;
}