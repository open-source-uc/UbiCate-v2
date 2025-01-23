"use client";
import { useRouter } from "next/navigation";

import { useEffect } from "react";

import { getCampusFromUserLocation } from "@/utils/getCampusBounds";

export default function NavegateToCampus() {
  const router = useRouter();

  useEffect(() => {
    const firstTime = sessionStorage.getItem("firstTime") ?? "true";
    if (firstTime === "true") {
      alert("test");

      sessionStorage.setItem("firstTime", "false");
      getCampusFromUserLocation().then((campus) => {
        if (!campus) return;
        router.push("/map?campus=" + campus);
      });
    }
  }, [router]);

  return null;
}
