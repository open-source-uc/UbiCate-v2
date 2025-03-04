export default function LocationButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={() => onClick?.()}
      className="p-3 rounded-full bg-brown-medium border-1 border-brown-dark hover:bg-brown-light text-white flex items-center justify-center w-14 h-14 pointer-events-auto cursor-pointer"
    >
      <span className="material-symbols-outlined">my_location</span>
    </button>
  );
}
