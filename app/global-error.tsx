"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("🚨 Global Error:", error);
    console.error("Error digest:", error.digest);
    console.error("Stack trace:", error.stack);
  }, [error]);

  return (
    <html>
      <body>
        <h1>🚨 ERROR CRÍTICO DE LA APLICACIÓN</h1>

        <p>
          <strong>Mensaje del error:</strong>
        </p>
        <p>{error.message || "Ha ocurrido un error grave inesperado"}</p>

        <hr />

        <h2>⚠️ IMPORTANTE - REPORTAR ERROR</h2>
        <p>Por favor, reporta este error enviando una captura de pantalla a:</p>
        <p>
          <strong>📱 Instagram: @opensource_euc</strong>
        </p>
        <p>Incluye el stack trace completo para ayudarnos a solucionarlo rápidamente.</p>

        <hr />

        <details>
          <summary>
            <strong>Ver stack trace completo (clic para expandir)</strong>
          </summary>
          <pre>{error.stack}</pre>
        </details>

        {error.digest ? (
          <div>
            <p>
              <strong>Error Digest:</strong> {error.digest}
            </p>
          </div>
        ) : null}

        <hr />

        <div>
          <button onClick={reset}>🔄 Intentar nuevamente (click aquí)</button>

          <button onClick={() => window.location.reload()}>🌐 Recargar página completa (click aquí)</button>
        </div>

        <hr />

        <p>
          <small>
            Una solución temporal puede ser limpiar la caché del navegador o intentar usar el modo incógnito. Sin
            embargo, por favor repórtalo a @opensource_euc en Instagram para que podamos resolver el problema. Asegúrate
            de enviar el stack trace completo.
          </small>
        </p>
      </body>
    </html>
  );
}
