import assert from "node:assert/strict";
import test from "node:test";

import { nameFilter } from "../app/components/features/filters/pills/placeFilters.ts";

test("finds a place by its popular name", () => {
  const canonicalPlace = {
    properties: {
      name: "Biblioteca de Humanidades",
      popularName: "La pecera",
    },
  };

  const matches = nameFilter({ features: [canonicalPlace] }, "la pec");

  assert.deepEqual(matches, [canonicalPlace], "popular-name query should return the canonical place");
});
