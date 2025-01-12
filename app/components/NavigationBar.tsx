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
                <aside className="fixed inset-y-0 left-0 bg-neutral-800 w-16 flex flex-col z-50">
                    <div className="flex flex-col items-center py-6 px-4 space-y-6">
                        <div className="mt-auto mb-4 flex justify-center">
                            <button
                                onClick={toggleSidebar}
                                className="text-gray-400 hover:text-white"
                            >
                                <span className="material-symbols-outlined md-24 self-center">dock_to_right</span>
                            </button>
                        </div>
                        <button className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-300 hover:text-white">
                            <span className="material-icons md-24">search</span>
                        </button>
                        <button className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-300 hover:text-white">
                            <span className="material-icons md-24">map</span>
                        </button>
                        <button className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-300 hover:text-white">
                            <span className="material-symbols-outlined md-24">menu_book</span>
                        </button>
                    </div>
                </aside>
            )}

            {/* Expanded Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 bg-neutral-800 text-white transform transition-transform duration-300 z-50 ${isOpen ? "translate-x-0 w-64" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full m-2">
                    <div className="flex items-center p-4 space-x-4">
                        <Link href="/" className="text-blue-500">
                            <img src="/logo.svg" alt="Logo" className="md-24" width={"48rm"} />
                        </Link>
                        <div className="flex-row-reverse">
                            <button
                                onClick={toggleSidebar}
                                className="text-gray-400 hover:text-white"
                            >
                                <span className="material-symbols-outlined md-24">dock_to_right</span>
                            </button>
                        </div>
                    </div>

                    <nav className="flex-1">
                        <div className="pt-5 space-y-4">
                            <button className="w-full flex items-center space-x-4 p-2 rounded hover:bg-neutral-700">
                                <span className="material-icons md-24">search</span>
                                <span>Buscar</span>
                            </button>
                            <button className="w-full flex items-center space-x-4 p-2 rounded hover:bg-neutral-700">
                                <span className="material-icons md-24">map</span>
                                <span>Campus</span>
                            </button>
                            <button className="w-full flex items-center space-x-4 p-2 rounded hover:bg-neutral-700">
                                <span className="material-symbols-outlined md-24">menu_book</span>
                                <span>Guías</span>
                            </button>
                        </div>
                    </nav>

                    <div className="flex-col">

                        <div className="mt-4 px-4 rounded-md bg-neutral-700">
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