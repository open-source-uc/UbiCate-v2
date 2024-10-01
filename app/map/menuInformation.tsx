import React from "react";

import { Feature } from "../../utils/types";
import { siglas as MapSiglas } from "../../utils/types";
interface MenuProps {
    place: Feature | null;
}



export default function Menu({ place }: MenuProps) {

    return (
        <>

            <menu
                className={`absolute sm:h-full bottom-0 left-0 z-20 h-1/2 sm:w-6/12 md:w-5/12 lg:w-3/12 w-full  sm:mt-0 transition-transform duration-300 ease-in-out  rounded-t-menu sm:rounded-none overflow-y-auto ${place ? "translate-x-0" : "-translate-x-full"} dark:bg-dark-1 bg-gray-200 shadow-lg font-normal text-lg`}

            >
                <div className="p-4 dark:text-white text-gray-700">
                    <h2 className="text-2xl font-semibold mb-2">{place ? place.properties.name : "Lugar no disponible"}</h2>

                    <div className="flex justify-between">
                        <span className="font-semibold">Piso/s:</span>
                        <span>{place ? place.properties.floor : "N/A"}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="font-semibold">Categoría:</span>
                        <span>{place ? MapSiglas.get(place.properties.categories) || "N/A" : "N/A"}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="font-semibold">Campus:</span>
                        <span>{place ? MapSiglas.get(place.properties.campus) : "N/A"}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="font-semibold">Longitud, Latitud:</span>
                        <span>{place ? place.geometry.coordinates[0].toFixed(2) : "N/A"}, {place ? place.geometry.coordinates[1].toFixed(2) : "N/A"}</span>
                    </div>

                    <h3 className="text-xl font-semibold mt-4">Información</h3>
                    <p className="mt-2 min-h-16">
                        {place ? place.properties.information == "" ? "N/A" : place.properties.information : "N/A"}
                    </p>

                    <div className="mt-4 flex space-x-4">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Editar
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>


            </menu>
        </>
    );
}
