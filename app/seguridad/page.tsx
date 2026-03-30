import Link from "next/link";
import * as Icon from "../components/ui/icons/icons";
import FindNearestDeaButton from "./FindNearestDeaButton";

export default function Page() {
  return (
    <main spellCheck="false" className="min-h-screen w-full pb-7 flex items-center justify-center">
      <div className="w-full text-center px-4 max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-6 text-white-ubi hover:text-primary transition-colors duration-200 underline"
        >
          ← Volver a inicio
        </Link>

        <div className="rounded-xl p-6 md:p-8 text-left bg-secondary/70 border border-border/60 backdrop-blur-sm">
          <p className="text-lg md:text-xl font-bold mb-5 text-white-ubi">
            En caso de emergencia en el campus, comuníquese al siguiente número:
          </p>

          <a
            href="tel:+56 9 5504 5000"
            className="w-full inline-flex items-stretch rounded-lg overflow-hidden bg-chart-security text-background shadow-lg transition-opacity duration-200 hover:opacity-90"
          >
            <span className="w-14 shrink-0 inline-flex items-center justify-center bg-black/15 border-r border-background/30">
              <Icon.Emergency className="w-6 h-6 text-background" />
            </span>
            <span className="flex-1 px-5 py-3 text-base md:text-lg font-semibold text-center">+56 9 5504 5000</span>
            <span aria-hidden="true" className="hidden md:inline-block w-14 shrink-0" />
          </a>
        </div>

        <br />

        <div className="rounded-xl p-6 md:p-8 text-left bg-secondary/70 border border-border/60 backdrop-blur-sm">
          <p className="text-lg md:text-xl font-bold mb-5 text-white-ubi">
            En caso de necesitar un desfribiliador automático externo (DEA)
          </p>

          <FindNearestDeaButton />
        </div>
      </div>
    </main>
  );
}

export const runtime = "edge";
