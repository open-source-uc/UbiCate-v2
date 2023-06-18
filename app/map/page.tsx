import Map from "./map";
import PlacesJSON from '../places.json';

export default async function Page() {

  return (
    <Map Places={PlacesJSON}/>
  )
}
