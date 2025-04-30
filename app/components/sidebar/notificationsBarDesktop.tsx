import { use } from "react";

import { NotificationContext } from "@/app/context/notificationCtx";

export default function NotificationBarDesktop() {
  const { component } = use(NotificationContext);

  return (
    <section className="fixed top-0 right-0 w-full z-50 py-2 px-4 flex flex-col md:flex-row lg:items-start lg:justify-end gap-2 pointer-events-none">
      <div className="w-full max-w-[450px] flex flex-col gap-2">{component ? component : null}</div>
    </section>
  );
}
