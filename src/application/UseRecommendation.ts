import {useEffect, useRef, useState} from "react";
import {RecommendationViewsManager} from "../presentation/RecommendationViewsManager";
import {ParkingLotViewsManager} from "../presentation/ParkingLotViewsManager";
import {StallTypeViewsManager} from "../presentation/StallTypeViewsManager";
import {StallTypeView} from "../presentation/StallTypeView";
import {ParkingLotView} from "../presentation/ParkingLotView";
import {RecommendationView} from "../presentation/RecommendationView";
import {ParkingLot} from "../core/create-parking-lot";
import {calculateClosestStallLot} from "../core/calculate-closest-stall-lot";
import {calculateMaxAvailabilityLot} from "../core/calculate-max-availability-lot";
import {Recommendation} from "../core/Recommendation";
import {Address, createAddress} from "../core/create-address";
import {Address as DawaAddress} from "dawa-autocomplete-react"
import {Coordinates} from "../core/Coordinates";
import {ParkingService} from "../core/ParkingService";

const STALL_TYPES_INCLUDED_BY_DEFAULT: string[] = ["default", "curb"];

export function useRecommendation(service: ParkingService): RecommendationViewsManager & ParkingLotViewsManager & StallTypeViewsManager {
    const parkingLots = useRef<ParkingLot[]>([]);

    const [parkingLotViews, setParkingLotViews] = useState<ParkingLotView[]>([]);
    const [stallTypeViews, setStallTypeViews] = useState<StallTypeView[]>([]);
    const [recommendationViews, setRecommendationViews] = useState<RecommendationView[] | null>([]);

    const [isGettingParkingLots, setIsGettingParkingLots] = useState<boolean>(false);
    const [isRecommending, setIsRecommending] = useState<boolean>(false);

    const addressRef = useRef<Address | null>(null);

    const [isParkingLotCheckToggled, setIsParkingLotCheckToggled] = useState<boolean>(false);

    useEffect((): void => {
        (async (): Promise<void> => {
            let lots: ParkingLot[] = []
            setIsGettingParkingLots(true);
            try {
                lots = await service.getParkingLots();
            } finally {
                setIsGettingParkingLots(false);
            }
            parkingLots.current = lots;

            _updateParkingLotViews();
            _updateStallTypeViews();
        })();
    }, []);

    return {
        parkingLots: parkingLotViews,
        isGettingParkingLots,
        toggleParkingLotCheck,
        stallTypes: stallTypeViews,
        isGettingStallTypes: isGettingParkingLots,
        toggleStallTypeCheck,
        recommendations: recommendationViews,
        recommendParkingLot,
        isRecommending,
        addressObserver
    }

    async function recommendParkingLot(): Promise<void> {
        if(_getIncludedStallTypes().length < 1) {
            return;
        }
        if (addressRef.current) {
            await _recommendClosestStallLot(addressRef.current.location);
            return;
        }
        await _recommendMaxAvailabilityLot();
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
        setIsParkingLotCheckToggled(true);
    }

    function addressObserver(address: DawaAddress | null): void {
        if (!address || !address.location) {
            addressRef.current = null;
            return;
        }
        addressRef.current = createAddress(address.id, address.type, address.location, address.entranceAddressId);
        _updateParkingLotViews();
    }

    function _updateParkingLotViews(): void {
        const location: Coordinates | null = addressRef.current?.location ?? null;
        const nextViews: ParkingLotView[] = parkingLots.current
            .map((pl: ParkingLot): ParkingLotView => {
                let isChecked: boolean = !!addressRef.current;
                if (isParkingLotCheckToggled) {
                    isChecked = (parkingLotViews.find((w: ParkingLotView): boolean => w.parkingLotId === pl.id)?.isChecked ?? isChecked);
                }
                return mapToParkingLotView(pl, isChecked, location);
            })
            .sort((viewA: ParkingLotView, viewB: ParkingLotView): number => {
                    return (viewA.distance?.value ?? Number.MAX_SAFE_INTEGER) - (viewB.distance?.value ?? Number.MAX_SAFE_INTEGER)
                }
            );
        setParkingLotViews(nextViews);
    }

    function _updateStallTypeViews(): void {
        const stallTypes: Set<string> = parkingLots.current
            .map((pl: ParkingLot): Set<string> => pl.getDistinctStallTypes())
            .reduce((p: Set<string>, c: Set<string>): Set<string> => {
                return new Set([...p, ...c]);
            });
        setStallTypeViews([...stallTypes]
            .map((st: string): StallTypeView => {
                return {isChecked: STALL_TYPES_INCLUDED_BY_DEFAULT.includes(st.toLowerCase()), type: st}
            }));
    }

    async function _recommendMaxAvailabilityLot(): Promise<void> {
        const includedParkingLots: ParkingLot[] = _getIncludedParkingLots();
        const includedStallTypes: string[] = _getIncludedStallTypes();
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

    async function _recommendClosestStallLot(location: Coordinates): Promise<void> {
        const includedParkingLots: ParkingLot[] = _getIncludedParkingLots();
        const includedStallTypes: string[] = _getIncludedStallTypes();
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

    function _getIncludedParkingLots(): ParkingLot[] {
        const includedIds: string[] = parkingLotViews
            .filter((plw: ParkingLotView): boolean => plw.isChecked)
            .map((plw: ParkingLotView): string => plw.parkingLotId);
        return parkingLots.current.filter((pl: ParkingLot): boolean => includedIds.includes(pl.id));
    }

    function _getIncludedStallTypes(): string[] {
        return stallTypeViews
            .filter((st: StallTypeView): boolean => st.isChecked)
            .map((st: StallTypeView): string => st.type);
    }
}

function mapToParkingLotView(pl: ParkingLot, isChecked: boolean, location: Coordinates | null): ParkingLotView {
    return {
        parkingLotId: pl.id,
        name: pl.name,
        isChecked: isChecked,
        distance: !!location ? {
            value: pl.calculateDistanceInMeters(location.latitude, location.longitude) ?? -1,
            unitAbbreviation: "m"
        } : undefined
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