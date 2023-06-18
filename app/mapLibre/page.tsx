import MapLibre from "./mapLibre";
import PlacesJSON from '../places.json';


export default async function Page() {

  return (
    <MapLibre Places={PlacesJSON}/>
  )
}
