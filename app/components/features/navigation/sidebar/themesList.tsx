import { CloseButton } from "@/app/components/ui";
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
        <CloseButton onClick={() => setActiveSubSidebar(null)} />
      </div>

      {/* Themes section following sidebar pattern */}
      <section className="flex-1 px-4 pt-4 pb-8">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            {themes.map((themeOption) => {
              const IconComponent = themeOption.ui.icon;
              return (
                <button
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id)}
                  type="button"
                  className={`border border-border w-full flex items-center gap-3 p-2 rounded-md transition ${
                    theme === themeOption.id ? "bg-primary" : "bg-transparent"
                  }`}
                  aria-pressed={theme === themeOption.id}
                >
                  {/* Icon container following sidebar pattern */}
                  <span
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      theme === themeOption.id ? "bg-primary-foreground/20" : "bg-accent"
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 ${theme === themeOption.id ? "fill-background" : "fill-background"}`}
                    />
                  </span>

                  {/* Text content */}
                  <div className="flex-1 text-left">
                    <p
                      className={`text-sm font-medium ${
                        theme === themeOption.id ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {themeOption.ui.name}
                    </p>
                    <p
                      className={`text-xs ${
                        theme === themeOption.id ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {themeOption.ui.description}
                    </p>
                  </div>

                  {/* Active indicator */}
                  {theme === themeOption.id && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
