"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "1.5rem",
          backgroundColor: "#f8fafc",
          color: "#0f172a",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <title>Nubelity TS</title>

        <main
          style={{
            maxWidth: "24rem",
            width: "100%",
            textAlign: "center",
            border: "1px solid #e2e8f0",
            borderRadius: "0.75rem",
            backgroundColor: "#ffffff",
            padding: "2rem",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
            Algo no salió bien
          </h1>
          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "0.875rem",
              color: "#64748b",
            }}
          >
            No pudimos mostrar la página. Vuelve a intentarlo.
          </p>

          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: "1.5rem",
              border: 0,
              borderRadius: "0.5rem",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
