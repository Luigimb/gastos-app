"use client";

import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const categories = [
  "Mercado",
  "Cena fuera",
  "Cine",
  "Transporte",
  "Compras",
  "Ocio",
  "Casa",
  "Otros",
];

export default function EditExpensePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Mercado");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadExpense() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setMessage("No se pudo cargar el gasto.");
        setLoading(false);
        return;
      }

      setAmount(String(data.amount));
      setCategory(data.category);
      setDate(data.date);
      setNote(data.note ?? "");
      setLoading(false);
    }

    loadExpense();
  }, [id, router, supabase]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("Guardando cambios...");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("No hay sesión activa.");
      return;
    }

    const { error } = await supabase
      .from("expenses")
      .update({
        amount: Number(amount),
        category,
        date,
        note: note || null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setMessage("Error al guardar los cambios.");
      return;
    }

    setMessage("Cambios guardados ✅");
    router.push("/expenses");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 p-6 text-neutral-900">
        <div className="mx-auto max-w-md">
          <p>Cargando gasto...</p>
        </div>
      </main>
    );
  }
return (
    <main className="min-h-screen bg-neutral-50 p-6 text-neutral-900">
      <div className="mx-auto max-w-md">
        <Link
          href="/expenses"
          className="mb-4 inline-block text-sm text-neutral-600 hover:text-neutral-900"
        >
          ← Volver a gastos
        </Link>

        <h1 className="text-3xl font-bold">Editar gasto</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Corrige el gasto que ya habías guardado.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Importe</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Fecha</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Nota (opcional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-white hover:bg-neutral-800"
          >
            Guardar cambios
          </button>

          {message ? (
            <p className="text-sm text-neutral-600">{message}</p>
          ) : null}
        </form>
      </div>
    </main>
  );
}
