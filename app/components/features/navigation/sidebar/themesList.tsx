import * as Icons from "@/app/components/ui/icons/icons";
import { useTheme } from "@/app/context/themeCtx";
import { getAllThemes } from "@/lib/themes";
import { SubSidebarType } from "@/lib/types";

export default function ThemesList({ setActiveSubSidebar }: { setActiveSubSidebar: (value: SubSidebarType) => void }) {
  const { setTheme, theme } = useTheme();

  // Get all themes from the centralized registry
  const themes = getAllThemes();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-4 py-3">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="font-bold text-lg text-foreground">Temas Disponibles</h3>
            <p className="text-xs text-muted-foreground">Personaliza tu experiencia</p>
          </div>
        </div>
        <button
          onClick={() => setActiveSubSidebar(null)}
          className="w-8 h-8 bg-primary flex items-center justify-center rounded-full cursor-pointer group hover:bg-secondary transition"
          aria-label="Cerrar menú"
        >
          <Icons.Close className="w-4 h-4 fill-background group-hover:fill-secondary-foreground" />
        </button>
      </div>

      {/* Themes section following sidebar pattern */}
      <section className="flex-1 px-4 pt-4 pb-8">
        <div className="flex flex-col gap-2">
          <div className="bg-secondary rounded-lg p-2 space-y-2">
            {themes.map((themeOption) => {
              const IconComponent = themeOption.ui.icon;
              const isActive = theme === themeOption.id;
              return (
                <button
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id)}
                  type="button"
                  className={`w-full flex items-center gap-3 p-2 rounded-md transition hover:bg-accent/18 ${
                    isActive ? "bg-primary" : "bg-transparent"
                  }`}
                  aria-pressed={isActive}
                >
                  {/* Icon container following sidebar pattern */}
                  <span
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive ? "bg-primary-foreground/20" : "bg-background/70 border border-border"
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 fill-current ${isActive ? "text-primary-foreground" : "text-secondary-foreground"}`}
                    />
                  </span>

                  {/* Text content */}
                  <div className="flex-1 text-left">
                    <p
                      className={`text-sm font-medium ${isActive ? "text-primary-foreground" : "text-secondary-foreground"}`}
                    >
                      {themeOption.ui.name}
                    </p>
                    <p
                      className={`text-xs ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                    >
                      {themeOption.ui.description}
                    </p>
                  </div>

                  {/* Active indicator */}
                  {isActive && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
