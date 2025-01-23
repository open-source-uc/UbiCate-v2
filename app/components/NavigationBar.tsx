"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSidebar } from "../context/sidebarCtx";

export default function Sidebar() {
    const { isOpen, toggleSidebar } = useSidebar();
    const searchParams = useSearchParams();

    return (
        <>
            {/* Collapsed Sidebar */}
            {!isOpen && (
                <aside className="fixed inset-y-0 left-0 bg-licorice flex flex-col z-50">
                    <div className="flex flex-col items-center py-6 px-4 space-y-6">
                        <div className="mt-2 mb-10 flex justify-center">
                            <button
                                onClick={toggleSidebar}
                                className="text-snow hover:text-light-brown"
                            >
                                <span className="material-symbols-outlined md-24 self-center">dock_to_right</span>
                            </button>
                        </div>
                        <button className="w-10 h-10 bg-light-brown rounded-lg flex items-center justify-center text-snow hover:bg-azure hover:text-snow">
                            <span className="material-icons md-24">search</span>
                        </button>
                        <button className="w-10 h-10 bg-light-brown rounded-lg flex items-center justify-center text-snow hover:bg-azure hover:text-snow">
                            <span className="material-icons md-24">map</span>
                        </button>
                        <button className="w-10 h-10 bg-light-brown rounded-lg flex items-center justify-center text-snow hover:bg-azure hover:text-snow">
                            <span className="material-symbols-outlined md-24">menu_book</span>
                        </button>
                    </div>
                </aside>
            )}

            {/* Expanded Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 bg-licorice text-snow transform transition-transform duration-300 z-50 ${isOpen ? "translate-x-0 w-64" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full py-6 px-4 space-y-7">
                    <div className="flex items-center space-x-12">
                        <Link href="/">
                            <img src="/logo.svg" alt="Logo" className="md-24" width={"48rm"} />
                        </Link>
                        <div className="flex-row-reverse">
                            <button
                                onClick={toggleSidebar}
                                className="text-snow hover:text-light-brown"
                            >
                                <span className="material-symbols-outlined md-24">dock_to_right</span>
                            </button>
                        </div>
                    </div>

                    <nav className="flex-1">
                        <div className="pt-5 space-y-2">
                            <button className="w-full flex items-center space-x-4 p-2 rounded-md hover:bg-azure">
                                <span className="material-icons flex-col justify-center items-center bg-light-brown w-10 h-10 rounded-lg">search</span>
                                <span>Buscar</span>
                            </button>
                            <button className="w-full flex items-center space-x-4 p-2 rounded-md hover:bg-neutral-700">
                                <span className="material-icons md-2 bg-light-brown w-10 h-10 flex-column items-center rounded-lg">map</span>
                                <span>Campus</span>
                            </button>
                            <button className="w-full flex items-center space-x-4 p-2 rounded hover:bg-neutral-700">
                                <span className="material-symbols-outlined md-2 bg-light-brown w-10 h-10 flex-column items-center rounded-lg">menu_book</span>
                                <span>Guías</span>
                            </button>
                        </div>
                    </nav>

                    <div className="flex-col">

                        <div className="rounded-md bg-neutral-700">
                            <div className="text-sm text-gray-400">
                                <p>¿Crees que algo falta?</p>
                                <p>Ayúdanos agregándolo</p>
                            </div>
                            <Link
                                href={`/form-geo/${searchParams.get("campus") ? `?campus=${searchParams.get("campus")}` : ""}`}
                                className="mt-2 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
                            >
                                <span>Agregar ubicación</span>
                            </Link>
                        </div>

                        <div className="p-4">
                            <div className="text-xs text-gray-400">
                                Proyecto desarrollado por
                                <Link href="/credits" className="text-blue-500 block hover:underline">
                                    Open Source eUC
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </aside>
        </>
    );
}