"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ChevronLeft, Plus } from "lucide-react";

import campuses from "@/data/campuses.json";

import { useSidebar } from "../context/sidebarCtx";

export default function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebar();
  const searchParams = useSearchParams();

  return (
    <aside
      className={`fixed inset-y-0 left-0 bg-white dark:bg-dark-1 dark:text-white text-white transform transition-transform duration-300 z-40 ${
        isOpen ? "translate-x-0 w-full map-sm:w-72" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <header className="h-12 bg-sky-600 flex items-center">
          <div className="flex items-center p-1.5">
            <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-sky-700 ml-auto">
              <ChevronLeft />
            </button>
          </div>
        </header>

        <nav className="flex flex-col grow p-4 shadow-xl">
          <ul className="space-y-4 font-heading text-gray-700 dark:text-white">
            <li>
              <h3 className="text-lg font-bold mb-2">Campus</h3>
              <ul className="space-y-2">
                {campuses.features.map((campus) => (
                  <li key={campus.properties.campus}>
                    <Link
                      href={`/map?campus=${campus.properties.shortName}`}
                      passHref
                      className={`block px-4 rounded-lg transition-all hover:text-sky-600 dark:hover:text-sky-300 ${
                        searchParams.get("campus") === campus.properties.shortName
                          ? "text-sky-600 dark:text-sky-300"
                          : "text-gray-700 dark:text-white"
                      }`}
                      onClick={toggleSidebar}
                    >
                      {campus.properties.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <hr className="border-t border-gray-300 dark:border-gray-700" />
            <li>
              <Link
                onClick={toggleSidebar}
                href={`/form-geo/${searchParams.get("campus") ? `?campus=${searchParams.get("campus")}` : ""}`}
                className="flex items-center justify-center space-x-2 px-4 py-2 text-sky-600 dark:text-sky-300 rounded-full border border-sky-600 dark:border-sky-300 hover:bg-sky-300 dark:hover:bg-sky-700 transition-all"
              >
                <Plus />
                <p>Agrega nueva ubicación</p>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
