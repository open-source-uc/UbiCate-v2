import Image from "next/image";

import { SubSidebarType } from "@/utils/types";

import * as Icons from "../components/icons/icons";
export default function CampusList({
  handleCampusClick,
  setActiveSubSidebar,
}: {
  handleCampusClick: (campus: string) => void;
  setActiveSubSidebar: (value: SubSidebarType) => void;
}) {
  return (
    <>
      <div className="flex">
        <h3 className="font-bold text-lg">Campus</h3>
        <div className="flex w-full" />
        <button
          onClick={() => setActiveSubSidebar(null)}
          className="text-white-ubi bg-brown-light flex items-center rounded-full hover:text-brown-light hover:bg-brown-medium pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2 z-50 w-7 h-7 p-1"
          aria-label="Cerrar menú"
        >
          <Icons.Close />
        </button>
      </div>{" "}
      <div className="w-full grid grid-cols-2 gap-2 tablet:gap-3 desktop:grid-cols-1 desktop:gap-4">
        {/* Botón Campus San Joaquín */}
        <button
          onClick={() => handleCampusClick("SanJoaquin")}
          onKeyDown={(e) => e.key === "Enter" && handleCampusClick("SanJoaquin")}
          aria-label="Navega a Campus San Joaquín"
          role="navigation"
          tabIndex={0}
          className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
        >
          <Image
            src="/images/campus/san_joaquin.jpg"
            alt="Campus San Joaquín"
            fill
            className="object-cover rounded-lg transition-transform duration-300"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brown-dark/100 rounded-lg" />
          <div className="absolute inset-0 bg-brown-light/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 rounded-lg" />
          <div className="absolute bottom-0 left-0 p-2 tablet:p-3">
            <span className="text-white-ubi text-sm tablet:text-md font-semibold" aria-hidden="true">
              San Joaquín
            </span>
          </div>
        </button>
        {/* Botón Campus Casa Central */}
        <button
          onClick={() => handleCampusClick("CasaCentral")}
          onKeyDown={(e) => e.key === "Enter" && handleCampusClick("CasaCentral")}
          aria-label="Navega a Campus Casa Central"
          role="navigation"
          tabIndex={0}
          className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
        >
          <Image
            src="/images/campus/casa_central.jpg"
            alt="Campus Casa Central"
            fill
            className="object-cover rounded-lg transition-transform duration-300"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brown-dark/100 rounded-lg" />
          <div className="absolute inset-0 bg-brown-light/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 rounded-lg" />
          <div className="absolute bottom-0 left-0 p-2 tablet:p-3">
            <span className="text-white-ubi text-sm tablet:text-md font-semibold" aria-hidden="true">
              Casa Central
            </span>
          </div>
        </button>
        {/* Botón Campus Oriente */}
        <button
          onClick={() => handleCampusClick("Oriente")}
          onKeyDown={(e) => e.key === "Enter" && handleCampusClick("Oriente")}
          aria-label="Navega a Campus Oriente"
          role="navigation"
          tabIndex={0}
          className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
        >
          <Image
            src="/images/campus/oriente.jpg"
            alt="Campus Oriente"
            fill
            className="object-cover rounded-lg transition-transform duration-300"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brown-dark/100 rounded-lg" />
          <div className="absolute inset-0 bg-brown-light/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 rounded-lg" />
          <div className="absolute bottom-0 left-0 p-2 tablet:p-3">
            <span className="text-white-ubi text-sm tablet:text-md font-semibold" aria-hidden="true">
              Oriente
            </span>
          </div>
        </button>
        {/* Botón Campus Lo Contador */}
        <button
          onClick={() => handleCampusClick("LoContador")}
          onKeyDown={(e) => e.key === "Enter" && handleCampusClick("LoContador")}
          aria-label="Navega a Campus Lo Contador"
          role="navigation"
          tabIndex={0}
          className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
        >
          <Image
            src="/images/campus/lo_contador.jpg"
            alt="Campus Lo Contador"
            fill
            className="object-cover rounded-lg transition-transform duration-300"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brown-dark/100 rounded-lg" />
          <div className="absolute inset-0 bg-brown-light/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 rounded-lg" />
          <div className="absolute bottom-0 left-0 p-2 tablet:p-3">
            <span className="text-white-ubi text-sm tablet:text-md font-semibold" aria-hidden="true">
              Lo Contador
            </span>
          </div>
        </button>
        {/* Botón Campus Villarrica */}
        <button
          onClick={() => handleCampusClick("Villarrica")}
          onKeyDown={(e) => e.key === "Enter" && handleCampusClick("Villarrica")}
          aria-label="Navega a Campus Villarrica"
          role="navigation"
          tabIndex={0}
          className="relative w-full h-[80px] tablet:h-[90px] desktop:h-[100px] col-span-2 md:col-span-1 rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-location focus:ring-offset-2"
        >
          <Image
            src="/images/campus/villarrica.png"
            alt="Campus Villarrica"
            fill
            className="object-cover rounded-lg transition-transform duration-300"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brown-dark/100 rounded-lg" />
          <div className="absolute inset-0 bg-brown-light/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 rounded-lg" />
          <div className="absolute bottom-0 left-0 p-2 tablet:p-3">
            <span className="text-white-ubi text-sm tablet:text-md font-semibold" aria-hidden="true">
              Villarrica
            </span>
          </div>
        </button>
      </div>
    </>
  );
}
