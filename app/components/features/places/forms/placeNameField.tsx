interface PlaceNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  label?: string;
  placeholder?: string;
}

export function PlaceNameField({
  value,
  onChange,
  disabled,
  label = "Nombre de la Ubicación",
  placeholder = "Ej: K203, Biblioteca, Sala Álvaro Campos...",
}: PlaceNameFieldProps) {
  return (
    <div className="space-y-4">
      <label className="flex items-center justify-center text-md font-medium text-foreground" htmlFor="placeName">
        {label}
      </label>
      <p className="text-xs text-foreground/80 italic text-center">
        Ejemplo: &quot;Sala de Estudio&quot;, &quot;Fork&quot;, &quot;Departamento de Ciencia de la Computación&quot;
      </p>
      <input
        id="placeName"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block p-3 w-full text-sm rounded-lg border border-border bg-input text-foreground focus:ring-primary focus:outline-hidden focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder={placeholder}
        max={20}
        disabled={disabled}
      />
    </div>
  );
}
