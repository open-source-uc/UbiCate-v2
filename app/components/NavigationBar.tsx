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
                <aside className="fixed inset-y-0 left-0 bg-brown-dark text-white-ubi flex flex-col z-50">
                    <div className="flex flex-col items-center py-8 px-4 space-y-6">
                        <div className="mb-9 flex justify-center">
                            <button
                                onClick={toggleSidebar}
                                className="hover:text-brown-medium"
                            >
                                <span className="material-symbols-outlined self-center">dock_to_right</span>
                            </button>
                        </div>
                        <button className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center hover:bg-brown-medium">
                            <span className="material-symbols-outlined">search</span>
                        </button>
                        <button className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center hover:bg-brown-medium">
                            <span className="material-symbols-outlined">map</span>
                        </button>
                        <button className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center hover:bg-brown-medium">
                            <span className="material-symbols-outlined">menu_book</span>
                        </button>
                    </div>
                </aside>
            )}

            {/* Expanded Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 w-56 bg-brown-dark text-white-ubi text-snow transform transition-transform duration-300 z-50 ${isOpen ? "translate-x-0 w-64" : "-translate-x-full"
                    }`}
            >   
                <div className="flex flex-col h-full py-5 px-4 space-y-6">

                    {/* Logo and Button to Close Sidebar*/}
                    <div className="flex items-center justify-between">
                        <Link href="/">
                            <img src="/long-logo.svg" className="pl-2" alt="Logo" width={"120rm"}/>
                        </Link>
                        <div className="flex-row-reverse">
                            <button
                                onClick={toggleSidebar}
                                className="hover:text-brown-medium"
                            >
                                <span className="material-symbols-outlined">dock_to_right</span>
                            </button>
                        </div>
                    </div>

                    {/* Navigation Options */}
                    <nav className="flex-1">
                        <div className="pt-5 space-y-2">
                            <button className="w-full flex items-center space-x-4 p-2 rounded-md hover:bg-brown-medium">
                                <span className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined">search</span>
                                </span>
                                <span>Buscar</span>
                            </button>
                            <button className="w-full flex items-center space-x-4 p-2 rounded-md hover:bg-brown-medium">
                                <span className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined">map</span>
                                </span>
                                <span>Campus</span>
                            </button>
                            <button className="w-full flex items-center space-x-4 p-2 rounded hover:bg-brown-medium">
                                <span className="w-10 h-10 bg-brown-light rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined">menu_book</span>
                                </span>
                                <span>Guías</span>
                            </button>
                        </div>
                    </nav>

                    {/* Buttons for Promotion */}
                    <div className="flex-col space-y-4">
                        <div className="w-full rounded-xl bg-brown-light">
                            <div className="text-xs text-white-blue p-4">
                                ¿Crees que algo falta?
                                <Link 
                                    href={`/form-geo/${searchParams.get("campus") ? `?campus=${searchParams.get("campus")}` : ""}`} 
                                    className="font-semibold block hover:underline">
                                    Ayúdanos agregándolo
                                </Link>
                            </div>
                        </div>
                        <div className="w-full rounded-xl bg-blue-location">
                            <div className="text-xs text-white-blue p-4">
                                Proyecto desarrollado por
                                <Link href="/credits" className="font-semibold block hover:underline">
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