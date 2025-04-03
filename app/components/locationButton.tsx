import * as Icon from "../components/icons/icons";

export default function LocationButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={() => onClick?.()}
      className="p-1 rounded-full bg-brown-medium border-1 border-brown-dark hover:bg-brown-light text-white flex items-center justify-center w-12 h-12 pointer-events-auto cursor-pointer"
    >
      <Icon.GPS className="w-6 h-6" />
    </button>
  );
}
