import Places from "@/data/places.json"
import Areas from "@/data/areas.json"

const PlaceAndArea = {
    "type": "FeatureCollection",
    "features": [
        ...Places.features,
        ...Areas.features
    ]
}

export default PlaceAndArea
