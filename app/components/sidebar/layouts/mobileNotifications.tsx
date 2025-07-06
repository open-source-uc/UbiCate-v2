import { use } from "react";

import { NotificationContext } from "../../../context/notificationCtx";
import CustomSearchInput from "../../search/CustomSearchInput";

export default function TopMobileSidebar({ onSearchResult }: { onSearchResult?: (result: any) => void }) {
  const { component } = use(NotificationContext);

  return (
    <section className="fixed top-0 left-0 w-full z-50 py-2 px-4 flex flex-col md:flex-row lg:items-start lg:justify-start gap-2 pointer-events-none bg-background text-foreground">
      <div className="w-full max-w-[450px] mr-auto flex flex-col gap-2">
        <div className="w-full pointer-events-auto">
          <CustomSearchInput onResult={onSearchResult} placeholder="Buscar lugares en UC" className="w-full" />
        </div>
        {component ? component : null}
      </div>
    </section>
  );
}
