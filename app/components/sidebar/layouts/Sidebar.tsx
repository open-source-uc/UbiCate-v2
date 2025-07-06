import DesktopSidebar from "./desktopSidebar";
import MobileSidebar from "./mobileSidebar";

export default function Sidebar() {
  return (
    <>
      {/* Desktop */}
      <aside className="max-desktop:hidden">
        <DesktopSidebar />
      </aside>
      {/* Mobile & Tablet */}
      <footer className="desktop:hidden">
        <MobileSidebar />
      </footer>
    </>
  );
}
