import React from "react";

import { Feature } from "../../utils/types";

interface MenuProps {
    place: Feature | null;
}

export default function Menu({ place }: MenuProps) {
    return (
        <>

            <menu
                className={`absolute menu-sm:h-full bottom-0 left-0 z-20 h-1/2 menu-sm:w-1/4 w-full  menu-sm:mt-0 transition-transform duration-300 ease-in-out  rounded-t-menu menu-sm:rounded-none overflow-y-auto ${place ? "translate-y-0 menu-sm:translate-x-0" : "translate-y-full menu-sm:-translate-x-full"} dark:bg-dark-1 bg-gray-200 shadow-lg `}

            >
                <div className="p-4 dark:text-white text-gray-700">
                    <h2 className=" text-2xl font-semibold mb-2">{place ? place.properties.name : "Lugar no disponible"}</h2>
                    <div className="">
                        <span>Piso: {place ? place.properties.floor : "N/A"}</span>
                    </div>
                    <div className=" ">
                        <span>Categoria: {place ? place.properties.categories : "N/A"}</span>
                    </div>
                    <div className="">
                        <span>Informacion: {place ? place.properties.information : "N/A"}</span>
                    </div>
                    <div className="">
                        <span>Campus: {place ? place.properties.campus : "N/A"}</span>
                    </div>
                    <div className="">
                        <span>Longitud: {place ? place.geometry.coordinates[0].toFixed(2) : "N/A"}</span>
                    </div>
                    <div className="">
                        <span>Latitud: {place ? place.geometry.coordinates[1].toFixed(2) : "N/A"}</span>
                    </div>
                </div>
            </menu>
        </>
    );
}
