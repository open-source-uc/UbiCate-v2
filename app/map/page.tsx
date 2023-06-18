import Map from "./map";
import PlacesJSON from '../../data/example.json';

export default async function Page() {

  return (
    <Map Places={PlacesJSON}/>
  )
}
