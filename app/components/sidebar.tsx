"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import { ChevronLeft, Plus } from "lucide-react";

import campuses from "@/data/campuses.json";

import { useSidebar } from "../context/sidebarCtx";

export default function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebar();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleLinkClick = (href: string) => {
    
      toggleSidebar();
    
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 bg-sky-600 text-white z-10 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0 w-full sm:w-72" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center p-1.5">
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-sky-700 ml-auto">
          <ChevronLeft />
        </button>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-4 font-heading text-gray-200">
          <li>
            <h3 className="text-lg font-bold mb-1">Campus</h3>
            <ul className="space-y-2">
              {campuses.features.map((campus) => (
                <li key={campus.properties.campus}>
                  <Link
                    href={`/map?campus=${campus.properties.shortName}`}
                    passHref
                    className="block px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
                    onClick={() => handleLinkClick(`/map?campus=${campus.properties.shortName}`)}
                  >
                    {campus.properties.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <hr className="border-t border-sky-700 my-4" />
          <li>
            <Link
              onClick={toggleSidebar}
              href={`/form-geo/${searchParams.get("campus") ? `?campus=${searchParams.get("campus")}` : ""}`}
              className="flex items-center space-x-2 px-4 py-2 text-white bg-sky-600 rounded-full border border-sky-700 hover:bg-sky-700 transition-all"
            >
              <Plus />
              <p>Agrega nueva ubicación</p>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
