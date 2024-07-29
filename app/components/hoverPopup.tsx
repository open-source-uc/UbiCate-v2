import { Point } from "mapbox-gl";
import { Popup } from "react-map-gl";

function HoverPopup(props: any) {
  const { hoverInfo, selectedPlace, imageSrc } = props;
  return (
    <Popup
      longitude={hoverInfo.longitude}
      latitude={hoverInfo.latitude}
      closeButton={false}
      closeOnClick={false}
      offset={new Point(0, -10)}
      anchor="bottom"
      className="place"
      style={{
        backgroundColor: "transparent",
        padding: "0",
        margin: "0",
      }}
    >
      <style>
        {`
        .mapboxgl-popup-content{ /* no se puede modificar desde el tag de popup */
          padding: 0;
          margin: 0;
        }
        .mapboxgl-popup-content img{ 
          margin: 0;                /* siempre hereda un margen a la derecha aunque se fije en 0 */
          align-items: center;
          display: flex;
          justify-content: center;
        }
      `}
      </style>
      <div className="bg-dark-4 w-full p-2">
        <h3 className="font-semibold text-white break-words text-center"> {selectedPlace.name} </h3>
      </div>
      {imageSrc ? <img src={imageSrc} alt="" /> : null}
      <ul className="bg-white text-black w-full p-2">
        <li>{selectedPlace?.information}</li>
        <li>{selectedPlace?.faculties ? `Facultad de ${selectedPlace.faculties}` : null}</li>
        <li>{selectedPlace?.piso ? `Piso ${selectedPlace.piso}` : null}</li>
      </ul>
    </Popup>
  );
}

export default HoverPopup;
