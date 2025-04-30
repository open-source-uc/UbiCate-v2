import { use } from "react";

import * as Icons from "@/app/components/icons/icons";
import { NotificationContext } from "@/app/context/notificationCtx";

export default function TopMobileSidebar({
  refSearchContainer,
}: {
  refSearchContainer: React.RefObject<HTMLDivElement | null>;
}) {
  const { clearNotification, clearAllCodes, component } = use(NotificationContext);

  return (
    <section className="fixed top-0 left-0 w-max-[450px] md:w-full z-50 py-2 px-4 flex flex-col md:flex-row lg:items-start lg:justify-start gap-2">
      <div ref={refSearchContainer} className="w-full" />
      {component ? (
        <div
          className="
                pointer-events-auto cursor-pointer transition-colors duration-200
                flex items-center justify-start gap-3 px-4 py-3
                rounded-lg bg-brown-medium hover:bg-brown-light
                md:w-full
                
            "
        >
          {component}
          <div className="ml-auto flex-shrink-0">
            <button
              onClick={() => {
                clearNotification();
                clearAllCodes();
              }}
              className="text-white-ubi bg-brown-light flex items-center rounded-full hover:text-brown-light hover:bg-brown-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
              aria-label="Cerrar menú"
            >
              <Icons.Close />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
