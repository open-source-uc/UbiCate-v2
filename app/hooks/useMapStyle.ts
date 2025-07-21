import { useState, useEffect, useMemo } from "react";
import { StyleSpecification } from "react-map-gl/maplibre";
import { createMapLibreStyle } from "./mapStyle";

const lightMapColors = {
  background: "#f0f2f5",
  water: "#cfe8f3",
  waterway: "#b5d3e7",
  
  wood: "#c9dbd3",
  snow: "#ffffff",
  grass: "#d8eeda",
  scrub: "#e0efdc",
  crop: "#f1f4e6",
  
  park: "#cbe8cf",
  residential: "#e4e7ee",
  commercial: "#ece6f3",
  industrial: "#f4e6eb",
  cemetery: "#ddeedc",
  hospital: "#e5f6fb",
  school: "#fff7e6",
  airport: "#edf7ed",
  
  building: "#d6d6d6",
  buildingOutline: "#aaaaaa",
  
  path: "#cfcfcf",
  minor: "#d9d9d9",
  secondary: "#bdbdbd",
  primary: "#a0a0a0",
  trunk: "#8c8c8c",
  motorway: "#7a7a7a",
  railStart: "#666666",
  railEnd: "#4d4d4d",
  
  roadText: "#333333",
  roadTextHalo: "#ffffff",
  poiText: "#5e6e78",
  poiParkText: "#2f6d3a",
  poiTextHalo: "#ffffff",
  placeText: "#3e4d59",
  placeTextHalo: "#ffffff",
  
  boundary: "#aaaaaa",
};


const pinkCoquetteMapColors = {
  background: "#fff5f8",
  water: "#f9d9e3",
  waterway: "#f4c6d7",
  
  wood: "#f3d3f9",
  snow: "#fff0f4",
  grass: "#f9d9e3",
  scrub: "#f6eaf6",
  crop: "#fbe8ef",
  
  park: "#f0d5ec",
  residential: "#f7eaf6",
  commercial: "#fceaf1",
  industrial: "#f9d9e3",
  cemetery: "#eaeaf6",
  hospital: "#fff7f9",
  school: "#fcebef",
  airport: "#f6eaf6",
  
  building: "#f7cfd8",
  buildingOutline: "#e3aeb7",
  
  path: "#f3bcd0",
  minor: "#f4c6d7",
  secondary: "#e99ab3",
  primary: "#e47c9d",
  trunk: "#d16589",
  motorway: "#b85274",
  railStart: "#a04066",
  railEnd: "#7f2c4e",
  
  roadText: "#924c94",
  roadTextHalo: "#fff0f4",
  poiText: "#b984c5",
  poiParkText: "#ab68b8",
  poiTextHalo: "#fff0f4",
  placeText: "#803a93",
  placeTextHalo: "#f7eaf6",
  
  boundary: "#d5aedf",
};


