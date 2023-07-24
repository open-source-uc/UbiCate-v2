import "mapbox-gl/dist/mapbox-gl.css";

interface formikField {
  name: string;
  value: string;
  onChange: any;
  onBlur: any;
}

export default function NumberInputDisabled({ label, id, field }: { label: string; id: string; field: formikField }) {
  return (
    <div className="flex flex-col w-1/2 px-4 justify-center items-center text-light-4">
      <label className="my-2" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        disabled
        className="mu-2 block p-2.5 w-full text-s rounded-lg border bg-dark-3 border-dark-4 text-light-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="number"
        {...field}
      />
    </div>
  );
}
