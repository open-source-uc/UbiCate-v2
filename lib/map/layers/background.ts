import { LayerSpecification } from "maplibre-gl";


export default (background: string): LayerSpecification => ({
    id: 'background',
    type: 'background',
    paint: {
        'background-color': background,
    },
});