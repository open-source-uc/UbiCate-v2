import Map from "./map";
import PlacesJSON from '../../data/places.json';

export default async function Page() {

  return (
    <Map Places={PlacesJSON}/>
  )
}
