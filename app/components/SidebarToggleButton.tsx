"use client";

import { AlignJustify } from "lucide-react";
import { useSidebar } from "../context/sidebarCtx";

export default function SidebarToggleButton() {
    const { toggleSidebar } = useSidebar();

    return (
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-sky-700">
            <AlignJustify />
        </button>
    );
}
