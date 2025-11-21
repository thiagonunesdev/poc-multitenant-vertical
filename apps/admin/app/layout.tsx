import type { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "Admin – Multitenant",
  description: "Painel administrativo dos tenants (POC).",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
          backgroundColor: "#f1f5f9",
        }}
      >
        <header
          style={{
            padding: "12px 24px",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#0f172a",
            color: "#e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>Admin · Multi-tenant POC</strong>
            <span style={{ fontSize: 12, marginLeft: 8, opacity: 0.7 }}>
              painel de tenants
            </span>
          </div>
          <span style={{ fontSize: 12, opacity: 0.8 }}>
            Ambiente: desenvolvimento
          </span>
        </header>

        <main
          style={{
            padding: "24px",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          {children}
        </main>

        <footer
          style={{
            padding: "12px 24px",
            borderTop: "1px solid #e2e8f0",
            fontSize: 12,
            color: "#64748b",
            textAlign: "center",
          }}
        >
          POC Multitenant · Admin · {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
