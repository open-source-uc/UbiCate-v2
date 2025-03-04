import IconSelector from "./icons/icons";

export default function LocationButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={() => onClick?.()}
      className="p-3 rounded-full bg-brown-medium hover:bg-brown-dark text-white flex items-center justify-center w-14 h-14"
    >
      <IconSelector iconName="gps" className="w-8 h-8" />
    </button>
  );
}
