import { use } from "react";

import * as Icons from "@/app/components/icons/icons";
import { NotificationContext } from "@/app/context/notificationCtx";

export default function TopMobileSidebar({
  refSearchContainer,
}: {
  refSearchContainer: React.RefObject<HTMLDivElement | null>;
}) {
  const { message, type, setNotification } = use(NotificationContext);

  return (
    <section className="fixed top-0 right-0 w-full z-50 py-2 px-4 flex flex-col lg:flex-row lg:items-start lg:justify-end">
      <div ref={refSearchContainer} className="w-full lg:w-auto" />
      {message ? (
        <div
          className="
                pointer-events-auto cursor-pointer transition-colors duration-200
                flex items-center justify-start gap-3 px-4 py-3 mt-2 lg:mt-0 lg:ml-4
                rounded-lg bg-brown-medium hover:bg-brown-light
                w-full lg:max-w-md
            "
        >
          <div
            className="
                    flex items-center justify-center
                    min-w-[28px] min-h-[28px] desktop:min-w-[32px] desktop:min-h-[32px]
                    bg-blue-location rounded-md
                "
          >
            <Icons.Directions className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium whitespace-normal break-words desktop:text-base desktop:font-normal text-white">
            {message}
          </span>
          <div className="ml-auto flex-shrink-0">
            <button
              onClick={() => {
                setNotification(null, null, "locationError");
                console.log(message);
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
