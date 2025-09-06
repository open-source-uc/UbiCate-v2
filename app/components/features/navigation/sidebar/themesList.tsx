import * as Icons from "@/app/components/ui/icons/icons";
import { Theme, useTheme } from "@/app/context/themeCtx";
import { SubSidebarType } from "@/lib/types";

export default function ThemesList({ setActiveSubSidebar }: { setActiveSubSidebar: (value: SubSidebarType) => void }) {
  const { setTheme, theme } = useTheme();

  const themes: {
    id: Theme;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }[] = [
    {
      id: "light-formal",
      name: "Tema Diurno Formal",
      icon: Icons.Work,
      description: "Limpio y profesional",
    },
    {
      id: "pink-coquette",
      name: "Coquette",
      icon: Icons.Coquette,
      description: "Pink pony club 🎵",
    },
    {
      id: "",
      name: "Tema Café Matte",
      icon: Icons.Coffee,
      description: "Equilibrio perfecto",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="font-bold text-lg text-foreground">Temas Disponibles</h3>
            <p className="text-xs text-muted-foreground">Personaliza tu experiencia</p>
          </div>
        </div>
        <button
          onClick={() => setActiveSubSidebar(null)}
          className="w-8 h-8 text-foreground bg-accent flex items-center justify-center rounded-full "
          aria-label="Cerrar menú"
        >
          <Icons.Close className="w-4 h-4" />
        </button>
      </div>

      {/* Themes section following sidebar pattern */}
      <div className="flex-1 p-4">
        <div className="flex flex-col gap-2">
          <p className="text-md font-semibold text-foreground">Selecciona un tema</p>
          <div className="bg-secondary rounded-lg p-2 space-y-2">
            {themes.map((themeOption) => {
              const IconComponent = themeOption.icon;
              return (
                <button
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id)}
                  type="button"
                  className={`w-full flex items-center gap-3 p-2 rounded-md transition hover:bg-accent/18 ${
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
                      className={`w-5 h-5 ${theme === themeOption.id ? "text-primary-foreground" : "text-foreground"}`}
                    />
                  </span>

                  {/* Text content */}
                  <div className="flex-1 text-left">
                    <p
                      className={`text-sm font-medium ${
                        theme === themeOption.id ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {themeOption.name}
                    </p>
                    <p
                      className={`text-xs ${
                        theme === themeOption.id ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {themeOption.description}
                    </p>
                  </div>

                  {/* Active indicator */}
                  {theme === themeOption.id && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer informativo */}
        <div className="mt-6 p-3 bg-muted rounded-lg border border-border">
          <div className="flex items-center gap-2 text-xs">
            <p>Los temas se guardan automáticamente y se aplicarán en toda la aplicación</p>
          </div>
        </div>
      </div>
    </div>
  );
}
