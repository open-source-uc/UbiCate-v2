import { use } from "react";

import { NotificationContext } from "@/app/context/notificationCtx";

import { SearchDropdown } from "../../search/SearchDropdown";

export default function TopMobileSidebar() {
  const { component } = use(NotificationContext);

  return (
    <section 
      className="fixed top-0 left-0 w-full z-50 py-2 px-4 flex flex-col md:flex-row lg:items-start lg:justify-start gap-2 pointer-events-auto bg-theme-background text-theme-color"
      style={{
        paddingTop: 'calc(0.5rem + var(--safe-area-inset-top))',
        paddingLeft: 'calc(1rem + var(--safe-area-inset-left))',
        paddingRight: 'calc(1rem + var(--safe-area-inset-right))',
      }}
    >
      <div className="w-full max-w-[450px] mr-auto flex flex-col gap-2">
        <SearchDropdown numberOfShowResults={5} />
        {component ? component : null}
      </div>
    </section>
  );
}
