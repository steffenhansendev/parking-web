export namespace Time {
    export const ENDING_OF_TIME: Date = new Date(Date.UTC(275000, 0, 1));
    export const BEGINNING_OF_TIME: Date = new Date(Date.UTC(-271820, 0, 1));
    export const ONE_DAY_IN_MILLISECONDS: number = 86400000;
    export const ONE_WEEK_IN_DAYS: number = 7;

    export function getIso8601UtcWeekNumber(date: Date = new Date()): number {
        const fourthJanuaryOfYear: Date = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
        const mondayInWeek1: Date = new Date(fourthJanuaryOfYear.valueOf() - getIso8601UtcDayIndex(fourthJanuaryOfYear) * ONE_DAY_IN_MILLISECONDS);

        date.setUTCHours(0, 0, 0, 0);
        const mondayInWeekOfDate: Date = new Date(date.valueOf() - getIso8601UtcDayIndex(date) * ONE_DAY_IN_MILLISECONDS);

        const deltaInWeeks: number = ((mondayInWeekOfDate.valueOf() - mondayInWeek1.valueOf()) / ONE_DAY_IN_MILLISECONDS) / ONE_WEEK_IN_DAYS;
        return Math.floor(deltaInWeeks) + 1;
    }

    function getIso8601UtcDayIndex(date: Date = new Date()): number {
        return (date.getDay() + 6) % 7;
    }
}