"use client";

import { useEffect, useState } from "react";

// Muestra un badge "En línea" arriba al centro cuando se recupera la conexión, y lo oculta solo tras
// unos segundos. NO recarga la página: los datos se refrescan aparte (sidebarCtx → refetch al reconectar).
export default function ConnectionBadge() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;

    const handleOnline = () => {
      setVisible(true);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setVisible(false), 2500);
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      role="status"
      className={`pointer-events-none fixed left-1/2 top-4 z-[2000] -translate-x-1/2 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow-lg">
        <span className="h-2 w-2 rounded-full bg-white" />
        En línea
      </div>
    </div>
  );
}
