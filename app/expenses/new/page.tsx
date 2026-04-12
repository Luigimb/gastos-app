"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const categories = [
  "🛒 Mercado",
  "🍽️ Cena fuera",
  "🎬 Cine",
  "🚌 Transporte",
  "🛍️ Compras",
  "🎉 Ocio",
  "🏠 Casa",
  "💊 Salud",
  "☕️ Café",
  "💼 Trabajo",
  "✈️ Viaje",
  "🎁 Regalos",
  "📺 Suscripciones",
  "📌 Otros",
];


export default function NewExpensePage() {
    const supabase = createClient();
    const router = useRouter();

    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("🛒 Mercado");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [note, setNote] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("Guardando...");

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setMessage("No hay sesión activa.");
            return;
        }

        const { error } = await supabase.from("expenses").insert({
            user_id: user.id,
            amount: Number(amount),
            category,
            date,
            note: note || null,
        });

        if (error) {
            setMessage("Error al guardar el gasto.");
            return;
        }

        setMessage("Gasto guardado ✅");
        setAmount("");
        setCategory("🛒 Mercado");
        setDate(new Date().toISOString().slice(0, 10));
        setNote("");

        router.refresh();
    }
    return (
        <main className="min-h-screen bg-neutral-50 p-6 text-neutral-900">
            <div className="mx-auto max-w-md">
                <Link
                    href="/"
                    className="mb-4 inline-block text-sm text-neutral-600 hover:text-neutral-900"
                >
                    ← Volver al inicio
                </Link>
                <h1 className="text-3xl font-bold">Nuevo gasto</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    Añade un gasto en unos segundos.
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
                            placeholder="12.50"
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
                            placeholder="Ej: cena con amigos"
                            className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-white hover:bg-neutral-800"
                    >
                        Guardar gasto
                    </button>

                    {message ? (
                        <p className="text-sm text-neutral-600">{message}</p>
                    ) : null}
                </form>
            </div>
        </main>
    );
}
