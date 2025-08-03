import { useState } from "react";

import MarkDownComponent from "@/app/components/markDown";

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export function DescriptionField({ value, onChange, disabled }: DescriptionFieldProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-center text-md font-medium text-foreground" htmlFor="information">
        Descripción (Opcional)
      </label>
      <p className="text-xs text-foreground/80 text-center italic">
        ¡Cuéntanos más sobre esta ubicación!
        <br />- Soporta markdown -
      </p>

      <div className="flex justify-end mb-2 space-x-2">
        <button
          type="button"
          className={`px-3 py-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
            !isPreviewMode
              ? "bg-primary text-primary-foreground"
              : "bg-transparent border border-border text-foreground"
          }`}
          onClick={() => setIsPreviewMode(false)}
          disabled={disabled}
        >
          Editar
        </button>
        <button
          type="button"
          className={`px-3 py-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
            isPreviewMode ? "bg-primary text-primary-foreground" : "bg-transparent border border-border text-foreground"
          }`}
          onClick={() => setIsPreviewMode(true)}
          disabled={disabled}
        >
          Vista Previa
        </button>
      </div>

      {isPreviewMode ? (
        <div className="bg-secondary rounded-md p-4 min-[h-20]">
          <MarkDownComponent>{value}</MarkDownComponent>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full field-sizing-content text-sm resize-none min-h-20 p-2 rounded-lg border border-border bg-input text-foreground focus:ring-primary focus:outline-hidden focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Puedes usar Markdown aquí..."
          rows={4}
          maxLength={1024}
          disabled={disabled}
        />
      )}
    </div>
  );
}
