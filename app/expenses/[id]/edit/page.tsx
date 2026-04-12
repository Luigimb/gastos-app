import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

type EditExpensePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditExpensePage({
  params,
}: EditExpensePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-neutral-50 p-6 text-neutral-900">
        <div className="mx-auto max-w-md">
          <p>No has iniciado sesión.</p>
          <Link href="/login" className="mt-4 inline-block underline">
            Ir al login
          </Link>
        </div>
      </main>
    );
  }

  const { data: expense, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !expense) {
    notFound();
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
          Aquí podrás corregir el gasto que ya habías guardado.
        </p>

        <form className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Importe</label>
            <input
              type="number"
              step="0.01"
              defaultValue={expense.amount}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Categoría</label>
            <select
              defaultValue={expense.category}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3"
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
              defaultValue={expense.date}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Nota (opcional)
            </label>
            <input
              type="text"
              defaultValue={expense.note ?? ""}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-white"
          >
            Guardar cambios
          </button>
        </form>
      </div>
    </main>
  );
}
