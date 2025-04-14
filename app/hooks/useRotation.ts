import { useState, useEffect } from "react";

export function useRotation(targetRotation: number) {
  const [currentRotation, setCurrentRotation] = useState<number>(0);

  useEffect(() => {
    const delta = ((targetRotation - currentRotation + 540) % 360) - 180;
    setCurrentRotation((prev) => prev + delta);
  }, [targetRotation, currentRotation]);

  return currentRotation;
}
