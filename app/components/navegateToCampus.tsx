"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getCampusFromUserLocation } from "@/utils/getCampusBounds";

export default function NavegateToCampus() {

    const firstTime: boolean = Boolean(sessionStorage.getItem("firstTime") ?? true);
    const router = useRouter();

    useEffect(() => {
        if (!firstTime) return;

        sessionStorage.setItem("firstTime", "false");
        getCampusFromUserLocation()
            .then((campus) => {
                console.log(campus)
                if (!campus)
                    return
                router.push("/map?campus=" + campus);
            })



    }, [router]);

    return null
}
