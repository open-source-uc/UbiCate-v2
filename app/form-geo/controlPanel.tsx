import * as React from "react";

const eventNames = ["onMarkerMove"];

function ControlPanel() {
  return (
    <div className="control-panel flex flex-col place-content-center">
      <div className="flex place-content-center">
        {eventNames.map((eventName) => {
          return (
            <p key={eventName} className="pb-5">
              Haz click o arrastra el marcador para indicar la ubicación
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(ControlPanel);
