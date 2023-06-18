import Map from "./map";
import PlacesJSON from '../places.json';

function convertToGeoJSONPoint(place : any) {
  const { id, name, category, campus, floor, parentId, latitude, longitude, description } = place;
  return {
    type: 'Feature',
    properties: {
      id,
      name,
      category,
      description,
      campus,
      floor,
      parentId,
    },
    geometry: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
  };
}

async function getPlacesInGeoJSON() {
  
  const response = await fetch('http://127.0.0.1:8090/api/collections/places/records?page=1&perPage=30', { cache: 'no-store' });
  const data = await response.json();
  const geoJSONFeatures = data?.items.map(convertToGeoJSONPoint);

  const geoJSONPlaces = {
    type: 'FeatureCollection',
    features: geoJSONFeatures,
  };
  
  return geoJSONPlaces;
}

export default async function Page() {

  const Places = await getPlacesInGeoJSON();
 
  return (
    <Map Places={Places}/>
  )
}
