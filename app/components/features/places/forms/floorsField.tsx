interface FloorsFieldProps {
  floors: (number | "")[];
  onChange: (floors: (number | "")[]) => void;
  disabled: boolean;
}

export function FloorsField({ floors, onChange, disabled }: FloorsFieldProps) {
  const handleFloorChange = (index: number, value: number | "") => {
    const newFloors = [...floors];
    newFloors[index] = value;
    onChange(newFloors);
  };

  const addFloor = () => {
    onChange([...floors, 1]);
  };

  const removeFloor = (index: number) => {
    if (floors.length > 1) {
      const newFloors = [...floors];
      newFloors.splice(index, 1);
      onChange(newFloors);
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-center text-md font-medium text-foreground" htmlFor="floor">
        Piso/s
      </label>
      <p className="text-xs text-foreground/80 text-center italic">
        Si corresponde, selecciona el piso en el que se encuentra la ubicación
      </p>
      {floors.map((floor, index) => (
        <div key={index} className="flex items-center gap-2 w-full">
          <input
            type="number"
            value={floor}
            onChange={(e) => handleFloorChange(index, parseInt(e.target.value) || "")}
            className="block p-3 w-full text-sm rounded-lg border border-border bg-input text-foreground focus:ring-primary focus:outline-hidden focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={`Piso ${index + 1}`}
            min={-10}
            max={20}
            disabled={disabled}
          />
          <button
            type="button"
            className="w-12 h-12 bg-transparent border border-border text-foreground rounded-full focus:ring-primary focus:outline-hidden focus:ring-2 transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            onClick={() => handleFloorChange(index, (floor || 1) - 1 === 0 ? -1 : (floor || 1) - 1)}
            disabled={disabled}
          >
            -
          </button>
          <button
            type="button"
            className="w-12 h-12 bg-transparent border border-border text-foreground rounded-full focus:ring-primary focus:outline-hidden focus:ring-2 transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            onClick={() => handleFloorChange(index, (floor || 1) + 1 === 0 ? 1 : (floor || 1) + 1)}
            disabled={disabled}
          >
            +
          </button>

          {floors.length > 1 && (
            <button
              type="button"
              className="w-12 h-12 bg-transparent border border-border text-foreground rounded-full focus:ring-primary focus:outline-hidden focus:ring-2 transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              onClick={() => removeFloor(index)}
              disabled={disabled}
            >
              x
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addFloor}
        className="text-sm text-primary hover:underline self-start disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
        disabled={disabled}
      >
        + Agregar otro piso
      </button>
    </div>
  );
}
