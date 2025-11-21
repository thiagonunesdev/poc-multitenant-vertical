"use client";

import { useState } from "react";
import type { Tenant } from "@repo/core-config";
import { Card } from "@repo/ui";

interface TenantConfigFormProps {
  tenant: Tenant;
}

export function TenantConfigForm({ tenant }: TenantConfigFormProps) {
  // DEBUG: se isso não aparecer no console ao carregar a página,
  // o componente nem chegou a hidratar no browser.
  console.log(
    "[TenantConfigForm] renderizou no cliente para tenant:",
    tenant.id
  );

  const [primary, setPrimary] = useState(tenant.theme.primary);
  const [secondary, setSecondary] = useState(tenant.theme.secondary);

  const [title, setTitle] = useState(
    tenant.seo?.title ?? `${tenant.name} — Seminovos e ofertas`
  );
  const [description, setDescription] = useState(
    tenant.seo?.description ??
      "Página padrão de listagem de veículos e campanhas para este tenant."
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    // DEBUG: se isso não aparecer ao clicar, o onClick não está rodando.
    console.log(
      "[TenantConfigForm] CLICOU em salvar para tenant",
      tenant.id,
      "com payload:",
      {
        theme: { primary, secondary },
        seo: { title, description },
      }
    );

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const url = `http://localhost:3003/tenants/${encodeURIComponent(
        tenant.id
      )}`;

      console.log("[TenantConfigForm] enviando PATCH para:", url);

      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: {
            primary,
            secondary,
          },
          seo: {
            title,
            description,
          },
        }),
      });

      console.log("[TenantConfigForm] resposta do PATCH:", res.status);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("[TenantConfigForm] corpo da resposta de erro:", text);

        throw new Error(
          `Falha ao salvar configurações (status ${res.status}). Verifique se o JSON Server de tenants está rodando na porta 3003.`
        );
      }

      setMessage("Configurações salvas com sucesso!");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao salvar configurações.";
      console.error("[TenantConfigForm] erro no handleSave:", err);
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Card de tema */}
      <Card className="space-y-3 p-4">
        <h2 className="font-semibold text-lg">Tema (cores)</h2>
        <p className="text-xs text-slate-500">
          Altere as cores primária e secundária deste tenant. Use o color picker
          ou digite o valor em hex (ex: #2563eb).
        </p>

        <div className="grid gap-4 text-sm">
          {/* Cor primária */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Cor primária
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="h-9 w-9 rounded border border-slate-200 p-0 cursor-pointer"
              />

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
              <input
                type="color"
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                className="h-9 w-9 rounded border border-slate-200 p-0 cursor-pointer"
              />

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

              <input
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
                placeholder="#0ea5e9"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Card de SEO */}
      <Card className="space-y-3 p-4">
        <h2 className="font-semibold text-lg">SEO (título e descrição)</h2>
        <p className="text-xs text-slate-500">
          Esses campos serão usados no título e description das páginas de
          anúncios deste tenant.
        </p>

        <div className="grid gap-3 text-sm">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Título (meta title)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
              placeholder="ACME Motors — Seminovos de qualidade"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Descrição (meta description)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border border-slate-200 px-2 py-1 text-sm resize-none"
              placeholder="Encontre o carro perfeito com ofertas especiais, financiamento flexível e garantia ACME."
            />
          </div>
        </div>
      </Card>

      {/* Rodapé com mensagens + botão nativo */}
      <div className="flex items-center justify-between gap-3 pt-2 text-xs">
        <div className="space-y-1">
          {message && <p className="text-emerald-600 font-medium">{message}</p>}
          {error && <p className="text-red-600 font-medium">{error}</p>}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md border border-slate-900 px-4 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Salvando configurações..." : "Salvar configurações"}
        </button>
      </div>
    </div>
  );
}
