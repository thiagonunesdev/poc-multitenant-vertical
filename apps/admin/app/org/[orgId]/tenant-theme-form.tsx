"use client";

import { useState, type FormEvent } from "react";
import type { Tenant } from "@repo/core-config";
import { Card, Button } from "@repo/ui";

interface TenantThemeFormProps {
  tenant: Tenant;
}

export function TenantThemeForm({ tenant }: TenantThemeFormProps) {
  const [primary, setPrimary] = useState(tenant.theme.primary);
  const [secondary, setSecondary] = useState(tenant.theme.secondary);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:3003/tenants/${encodeURIComponent(tenant.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            theme: {
              primary,
              secondary,
            },
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          `Falha ao salvar tema (status ${res.status}). Verifique se o JSON server de tenants está rodando na porta 3003.`
        );
      }

      setMessage(
        "Tema atualizado com sucesso. Recarregue o storefront para ver o efeito."
      );
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao salvar tema.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="space-y-3">
      <h2 className="font-semibold text-lg">Tema (cores)</h2>

      <p className="text-xs text-slate-500">
        Altere as cores primária e secundária deste tenant. Use o color picker
        ou digite o valor em hex.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 text-sm text-slate-700"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cor primária */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Cor primária
            </label>
            <div className="flex items-center gap-3">
              {/* Color picker */}
              <input
                type="color"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="h-9 w-9 rounded border border-slate-200 p-0 cursor-pointer"
              />

              {/* Preview bolinha */}
              <span
                style={{
                  display: "inline-block",
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  border: "1px solid #cbd5f5",
                  backgroundColor: primary,
                }}
              />

              {/* Campo de texto com hex */}
              <input
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
                placeholder="#2563eb"
              />
            </div>
          </div>

          {/* Cor secundária */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Cor secundária
            </label>
            <div className="flex items-center gap-3">
              {/* Color picker */}
              <input
                type="color"
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                className="h-9 w-9 rounded border border-slate-200 p-0 cursor-pointer"
              />

              {/* Preview bolinha */}
              <span
                style={{
                  display: "inline-block",
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  border: "1px solid #cbd5f5",
                  backgroundColor: secondary,
                }}
              />

              {/* Campo de texto com hex */}
              <input
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
                placeholder="#1d4ed8"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="space-y-1 text-xs">
            {message && (
              <p className="text-emerald-600 font-medium">{message}</p>
            )}
            {error && <p className="text-red-600 font-medium">{error}</p>}
          </div>

          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Salvando tema..." : "Salvar tema"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
