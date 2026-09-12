interface PopularNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export function PopularNameField({ value, onChange, disabled }: PopularNameFieldProps) {
  return (
    <div className="space-y-4">
      <label className="flex items-center justify-center text-md font-medium text-foreground" htmlFor="popularName">
        Nombre popular (Opcional)
      </label>
      <p className="text-xs text-foreground/80 italic text-center">
        Escribe el nombre coloquial por el que se conoce esta ubicación
      </p>
      <input
        id="popularName"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="block p-3 w-full text-sm rounded-lg border border-border bg-input text-foreground focus:ring-primary focus:outline-hidden focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder="Ej: La pecera"
        maxLength={100}
        disabled={disabled}
      />
    </div>
  );
}
