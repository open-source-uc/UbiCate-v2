import Link from "next/link";
import DarkModeSelector from "./darkModeSelector";
import SidebarToggleButton from "./SidebarToggleButton";


export default function Header() {
  const title = "UbiCate UC";

  return (
    <header className="w-full select-none text-white h-12 flex items-center relative z-30">
      <div className="w-full h-12 fixed flex items-center bg-sky-600 px-4">
        <div className="flex items-center mr-4">
          <SidebarToggleButton />
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 font-bold font-heading md:text-2xl text-lg">
          <Link href="/">
            <h1>{title}</h1>
          </Link>
        </div>

        <DarkModeSelector />
      </div>
    </header>
  );
}
