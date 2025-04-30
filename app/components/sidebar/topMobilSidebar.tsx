import { use } from "react";

import { NotificationContext } from "@/app/context/notificationCtx";

export default function TopMobileSidebar({
  refSearchContainer,
}: {
  refSearchContainer: React.RefObject<HTMLDivElement | null>;
}) {
  const { component } = use(NotificationContext);

  return (
    <section className="fixed top-0 left-0 w-full z-50 py-2 px-4 flex flex-col md:flex-row lg:items-start lg:justify-start gap-2 pointer-events-none bg-theme-background text-theme-color">
      <div className="w-full max-w-[450px] mr-auto flex flex-col gap-2">
        <div ref={refSearchContainer} className="w-full" />
        {component ? component : null}
      </div>
    </section>
  );
}
