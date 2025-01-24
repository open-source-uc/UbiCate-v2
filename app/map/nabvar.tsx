import PillFilter from "../components/pillFilter";

interface MapNavbarProps {
  ref: React.RefObject<HTMLSelectElement | null>;
  setGeocoderPlaces: (places: any[]) => void;
}

function MapNavbar({ ref, setGeocoderPlaces }: MapNavbarProps) {
  return (
    <menu className="fixed flex w-full pt-2 flex-col sm:flex-row gap-2 sm:gap-1 justify-start items-center z-10">
      <section ref={ref} className="sm:w-1/3 w-full" />
      <section className="flex w-full sm:w-2/3 justify-start items-center">
        <PillFilter setFilteredPlaces={setGeocoderPlaces} />
      </section>
    </menu>
  );
}

export default MapNavbar;
