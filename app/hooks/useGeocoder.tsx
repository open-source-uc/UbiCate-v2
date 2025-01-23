import React, { useState, useRef, useEffect } from "react";
import { Feature, JSONFeatures } from "@/utils/types";
import { handleResult, handleResults, handleClear } from "./placeHandlers";
const loadGeocoder = () => import("@/utils/getGeocoder");

function useGeocoder(Places: JSONFeatures, ref: React.RefObject<any> | null): [Feature[], (places: Feature[]) => void] {
    const [geocoderPlaces, setGeocoderPlaces] = useState<Feature[]>([]);
    const geocoder = useRef<any>(null);

    useEffect(() => {
        let mounted = true;

        const initializeGeocoder = async () => {
            const { default: getGeocoder } = await loadGeocoder();
            if (!mounted) return;

            geocoder.current = getGeocoder(
                (result: any) => {
                    handleResult(result, setGeocoderPlaces, Places);
                },
                (results: any) => mounted && handleResults(results, setGeocoderPlaces, Places),
                () => handleClear(setGeocoderPlaces),
            );

            ref?.current?.appendChild(geocoder.current.onAdd());
        };

        initializeGeocoder();

        return () => {
            mounted = false;
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [geocoderPlaces, setGeocoderPlaces];
}

export default useGeocoder;
