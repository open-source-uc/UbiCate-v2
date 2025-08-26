import * as Icons from "@/app/components/icons/icons";
import { Theme, useTheme, THEME_METADATA } from "@/app/context/themeCtx";
import { SubSidebarType } from "@/utils/types";

export default function ThemesList({ setActiveSubSidebar }: { setActiveSubSidebar: (value: SubSidebarType) => void }) {
  const { setTheme, theme } = useTheme();

  const themes: { id: Theme; name: string; description: string; emoji: string }[] = Object.values(
    THEME_METADATA,
  ).filter((meta) => {
    const ALLOW_THEMES: Theme[] = ["uc", "uc-light"];
    if (ALLOW_THEMES.includes(meta.id)) {
      return true;
    }
    return false;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">🎨</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Temas Disponibles</h3>
            <p className="text-xs text-content-tertiary">Personaliza tu experiencia</p>
          </div>
        </div>
        <button
          onClick={() => setActiveSubSidebar(null)}
          className="w-8 h-8 bg-accent text-accent-foreground flex items-center justify-center rounded-full "
          aria-label="Cerrar menú"
        >
          <Icons.Close className="w-4 h-4" />
        </button>
      </div>

      {/* Themes grid */}
      <div className="flex-1 p-4">
        <div className="w-full grid grid-cols-1 gap-3 desktop:gap-4">
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
              type="button"
              className={`
                group relative overflow-hidden
                transition-all duration-200
                text-surface-low-foreground bg-surface-low 
                text-left rounded-xl p-4 cursor-pointer
                hover:shadow-lg hover:scale-[1.02]
                border border-border
                ${theme === themeOption.id ? "ring-2 ring-interactive-primary ring-offset-2 scale-[1.02]" : ""}
              `}
            >
              {/* Indicador de tema activo */}
              {theme === themeOption.id && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-interactive-primary rounded-full" />
              )}

              {/* Contenido del botón */}
              <div className="flex items-center gap-3">
                {/* Icono emoji */}
                <div className="w-12 h-12 bg-accent text-accent-foreground rounded-xl flex items-center justify-center shadow-sm transition-transform duration-200 no-hover">
                  <span className="text-2xl">{themeOption.emoji}</span>
                </div>

                {/* Texto */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm desktop:text-base">{themeOption.name}</span>
                  </div>
                  <p className="text-xs mt-1">{themeOption.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer informativo */}
        <div className="mt-6 p-3 bg-surface-low rounded-lg border border-border">
          <div className="flex items-center gap-2 text-xs text-surface-low-foreground">
            <span>💡</span>
            <p>Los temas se guardan automáticamente y se aplicarán en toda la aplicación</p>
          </div>
        </div>
      </div>
    </div>
  );
}
