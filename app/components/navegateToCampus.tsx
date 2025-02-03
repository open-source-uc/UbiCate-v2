"use client";
import { useRouter } from "next/navigation";

import { useEffect } from "react";

import { getCampusFromUserLocation } from "@/utils/getCampusBounds";

export default function NavegateToCampus() {
  const router = useRouter();

  useEffect(() => {
    const firstTime = sessionStorage.getItem("firstTime") ?? "true";
    const defaultCampus = localStorage.getItem("defaultCampus") ?? null

    if (firstTime === "true") {
      sessionStorage.setItem("firstTime", "false");
      getCampusFromUserLocation().then((campus) => {
        if (campus !== null) {
          router.push("/map?campus=" + campus);
          return
        }

        if (defaultCampus !== null) {
          router.push("/map?campus=" + defaultCampus);
          return
        }
      });
    }
  }, [router]);

  return null;
}
