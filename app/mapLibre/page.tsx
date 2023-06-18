import MapLibre from "./mapLibre";
import PlacesJSON from '../../data/example.json';

export default async function Page() {

  return (
    <MapLibre Places={PlacesJSON}/>
  )
}
