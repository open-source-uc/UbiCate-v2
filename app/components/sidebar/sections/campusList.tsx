import { SubSidebarType } from "@/utils/types";

import { campuses } from "../data/config";
import CampusButton from "../ui/campusButton";
import SidebarCloseButton from "../ui/CloseButton";
import SidebarHeader from "../ui/sidebarHeader";

export default function CampusList({
  handleCampusClick,
  setActiveSubSidebar,
}: {
  handleCampusClick: (campus: string) => void;
  setActiveSubSidebar: (value: SubSidebarType) => void;
}) {
  return (
    <>
      <SidebarHeader
        title="Campus"
        rightContent={<SidebarCloseButton onClick={() => setActiveSubSidebar(null)} ariaLabel="Cerrar menú" />}
      />
      <div className="w-full grid grid-cols-2 gap-2 tablet:gap-3 desktop:grid-cols-1 desktop:gap-4 px-2">
        {campuses.map((campus) => (
          <CampusButton
            key={campus.key}
            campusKey={campus.key}
            campusName={campus.name}
            imageSrc={campus.imageSrc}
            onClick={handleCampusClick}
            className={campus.className}
          />
        ))}
      </div>
    </>
  );
}
