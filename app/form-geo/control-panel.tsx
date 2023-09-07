import * as React from "react";

import type { LngLat } from "react-map-gl";

const eventNames = ["onDrag"];

function round5(value: any) {
  return (Math.round(value * 1e5) / 1e5).toFixed(5);
}

function ControlPanel(props: { events: Record<string, LngLat> }) {
  return (
    <div className="control-panel flex flex-col place-content-center">
      <div className="flex place-content-center">
        {eventNames.map((eventName) => {
          const { events = {} } = props;
          const lngLat = events[eventName];
          const initialMsg = `Arrastra el marcador rojo para obtener las coordenadas`;
          return (
            <div key={eventName} className="pb-5">
              {lngLat ? <strong>Coordenadas:</strong> : initialMsg}{" "}
              {lngLat ? `${round5(lngLat.lng)}, ${round5(lngLat.lat)}` : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(ControlPanel);
