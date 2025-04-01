import {useEffect, useRef, useState} from "react";
import {RecommendationViewsManager} from "../components/recommender/RecommendationViewsManager";
import {ParkingLotViewsManager} from "../components/recommender/ParkingLotViewsManager";
import {StallTypeViewsManager} from "../components/recommender/StallTypeViewsManager";
import {StallTypeView} from "../components/recommender/StallTypeView";
import {ParkingLotView} from "../components/recommender/ParkingLotView";
import {RecommendationView} from "../components/recommender/RecommendationView";
import {ParkingLot} from "./create-parking-lot";
import {ParkingService} from "../integration/parking/create-parking-service";
import {calculateClosestStallLot} from "./calculate-closest-stall-lot";
import {calculateMaxAvailabilityLot} from "./calculate-max-availability-lot";
import {Recommendation} from "./Recommendation";
import {useDi} from "../dependency-injection/DiProvider";
import {Address} from "./Address";
import {Coordinates} from "./Coordinates";

const STALL_TYPES_INCLUDED_BY_DEFAULT: string[] = ["default", "curb"];

export function useRecommendation(): RecommendationViewsManager & ParkingLotViewsManager & StallTypeViewsManager {
    const service: ParkingService = useDi().resolveParkingService();
    const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);

    const [isGettingParkingLots, setIsGettingParkingLots] = useState<boolean>(false);
    const [isRecommending, setIsRecommending] = useState<boolean>(false);

    const [stallTypeViews, setStallTypeViews] = useState<StallTypeView[]>([]);
    const [parkingLotViews, setParkingLotViews] = useState<ParkingLotView[]>([]);
    const [recommendationViews, setRecommendationViews] = useState<RecommendationView[] | null>([]);

    const addressRef = useRef<Address | null>(null);

    useEffect((): void => {
        (async (): Promise<void> => {
            let lots: ParkingLot[] = []
            setIsGettingParkingLots(true);
            try {
                lots = await service.getParkingLots();
            } finally {
                setIsGettingParkingLots(false);
            }
            setParkingLots(lots);

            setParkingLotViews(lots.map((pl: ParkingLot): ParkingLotView => {
                return {
                    parkingLotId: pl.id,
                    name: pl.name,
                    isChecked: !!addressRef.current,
                    distance: undefined,
                    compareDistanceWith(other: ParkingLotView): number {
                        return (this.distance?.value ?? Number.MAX_SAFE_INTEGER) - (other.distance?.value ?? Number.MAX_SAFE_INTEGER);
                    }
                }
            }));

            const stallTypes: Set<string> = lots
                .map((pl: ParkingLot): Set<string> => pl.getDistinctStallTypes())
                .reduce((p: Set<string>, c: Set<string>): Set<string> => {
                    return new Set([...p, ...c]);
                });
            setStallTypeViews([...stallTypes]
                .map((st: string): StallTypeView => {
                    return {isChecked: STALL_TYPES_INCLUDED_BY_DEFAULT.includes(st.toLowerCase()), type: st}
                }));
        })();
    }, []);

    return {
        parkingLots: parkingLotViews,
        recommendations: recommendationViews,
        stallTypes: stallTypeViews,
        recommendParkingLot,
        toggleParkingLotCheck,
        toggleStallTypeCheck,
        calculateDistances,
        isGettingParkingLots,
        isGettingStallTypes: isGettingParkingLots,
        isRecommending,
        addressObserver(address: Address | null): void {
            addressRef.current = address;
            calculateDistances();
        }
    }

    async function recommendParkingLot(): Promise<void> {
        if (addressRef.current) {
            await recommendClosestStallLot(addressRef.current.location);
            return;
        }
        await recommendMaxAvailabilityLot();
    }

    function calculateDistances(): void {
        const location: Coordinates | undefined = addressRef.current?.location;
        if (!location) {
            return
        }
        const nextParkingLotViews: ParkingLotView[] = parkingLotViews.map((w: ParkingLotView): ParkingLotView => {
            const distanceInMeters: number | null = parkingLots
                .find((p: ParkingLot): boolean => p.id === w.parkingLotId)
                ?.calculateDistanceInMeters(location.latitude, location.longitude) ?? null;
            if (!distanceInMeters) {
                return w;
            }
            return {
                ...w,
                distance: {
                    value: distanceInMeters,
                    unitAbbreviation: "m"
                },
                isChecked: true
            }
        });
        nextParkingLotViews.sort((a: ParkingLotView, b: ParkingLotView): number => {
            return a.compareDistanceWith(b);
        });
        setParkingLotViews(nextParkingLotViews);
    }

    async function recommendMaxAvailabilityLot(): Promise<void> {
        const includedParkingLots: ParkingLot[] = getIncludedParkingLots();
        const includedStallTypes: string[] = getIncludedStallTypes();
        let recommendation: Recommendation | null = null;
        setIsRecommending(true);
        try {
            recommendation = await calculateMaxAvailabilityLot(includedParkingLots, new Set<string>(includedStallTypes));
        } finally {
            setIsRecommending(false);
        }
        if (!recommendation) {
            setRecommendationViews(null);
            return;
        }
        setRecommendationViews([
            mapToRecommendationView(recommendation)
        ]);
    }

    async function recommendClosestStallLot(location: Coordinates): Promise<void> {
        const includedParkingLots: ParkingLot[] = getIncludedParkingLots();
        const includedStallTypes: string[] = getIncludedStallTypes();
        let recommendation: Recommendation | null = null;
        setIsRecommending(true);
        try {
            recommendation = await calculateClosestStallLot(includedParkingLots, new Set<string>(includedStallTypes), location.latitude, location.longitude);
        } finally {
            setIsRecommending(false);
        }
        if (recommendation) {
            setRecommendationViews([
                mapToRecommendationView(recommendation, location)
            ]);
            return;
        }
        setRecommendationViews(null);
    }

    function toggleStallTypeCheck(i: number): void {
        setStallTypeViews(stallTypeViews.map((view: StallTypeView, j: number): StallTypeView => {
            if (i === j) {
                return {
                    ...view,
                    isChecked: !view.isChecked
                }
            }
            return view;
        }));
    }

    function toggleParkingLotCheck(i: number): void {
        setParkingLotViews(parkingLotViews.map((view: ParkingLotView, j: number): ParkingLotView => {
            if (i === j) {
                return {
                    ...view,
                    isChecked: !view.isChecked
                }
            }
            return view;
        }));
    }

    function getIncludedParkingLots(): ParkingLot[] {
        const includedIds: string[] = parkingLotViews
            .filter((plw: ParkingLotView): boolean => plw.isChecked)
            .map((plw: ParkingLotView): string => plw.parkingLotId);
        return parkingLots.filter((pl: ParkingLot): boolean => includedIds.includes(pl.id));
    }

    function getIncludedStallTypes(): string[] {
        return stallTypeViews
            .filter((st: StallTypeView): boolean => st.isChecked)
            .map((st: StallTypeView): string => st.type);
    }
}

function mapToRecommendationView(recommendation: Recommendation, location: Coordinates | null = null): RecommendationView {
    return {
        parkingLotId: recommendation.parkingLot.id,
        parkingLotName: recommendation.parkingLot.name,
        availableStallCount: recommendation.availability.count,
        asOf: recommendation.availability.asOf,
        distance: location ? {
            value: recommendation.parkingLot.calculateDistanceInMeters(location.latitude, location.longitude) ?? -1,
            unitAbbreviation: "m"
        } : undefined
    }
}
