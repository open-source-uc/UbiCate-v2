"use client";
import "mapbox-gl/dist/mapbox-gl.css";

interface formikField {
  name: string;
  onChange: any;
  onBlur: any;
}

export default function NumberInputDisabled({
  label,
  id,
  value,
  field,
}: {
  label: string;
  id: string;
  value: number;
  field: formikField;
}) {
  return (
    <div className="flex flex-col w-1/2 px-4 justify-center items-center">
      <label className="my-2" htmlFor={id}>
        {label}
      </label>
      <input id={id} disabled className="my-2 w-1/2 text-center pl-3" type="number" {...field} />
    </div>
  );
}
