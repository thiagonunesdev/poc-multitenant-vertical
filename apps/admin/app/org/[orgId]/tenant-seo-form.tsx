"use client";

import { useState, type FormEvent } from "react";
import { Card, Button } from "@repo/ui";

interface TenantSeoFormProps {
  tenantId: string;
  initialTitle: string;
  initialDescription: string;
}

export function TenantSeoForm({
  tenantId,
  initialTitle,
  initialDescription,
}: TenantSeoFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
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
        `http://localhost:3003/tenants/${encodeURIComponent(tenantId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seo: {
              title,
              description,
            },
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          `Falha ao salvar SEO (status ${res.status}). Verifique se o JSON server de tenants está rodando na porta 3003.`
        );
      }

      setMessage("Configurações de SEO atualizadas com sucesso.");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro desconhecido ao salvar SEO.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="space-y-3">
      <h2 className="font-semibold text-lg">SEO padrão</h2>
      <p className="text-xs text-slate-500">
        Estes campos definem o título e a descrição padrão usados pelo
        storefront nas páginas principais deste tenant.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 text-sm text-slate-700"
      >
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Título (title)
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

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="space-y-1 text-xs">
            {message && (
              <p className="text-emerald-600 font-medium">{message}</p>
            )}
            {error && <p className="text-red-600 font-medium">{error}</p>}
          </div>

          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Salvando SEO..." : "Salvar SEO"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
