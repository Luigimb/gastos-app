import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default async function ExpensesPage() {
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

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-neutral-50 p-6 text-neutral-900">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-neutral-600 hover:text-neutral-900"
        >
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold">Tus gastos</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Aquí puedes ver todos los gastos registrados.
        </p>

        <div className="mt-4 flex gap-3">
          <Link
            href="/expenses/new"
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
          >
            Añadir gasto
          </Link>
        </div>

        {error ? (
          <p className="mt-6 text-sm text-red-600">
            Ha habido un error al cargar los gastos.
          </p>
        ) : null}

        {!expenses || expenses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="font-medium">Todavía no hay gastos.</p>
            <p className="mt-1 text-sm text-neutral-600">
              Añade el primero para empezar a llevar el control.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{expense.category}</p>
                    <p className="text-sm text-neutral-600">{expense.date}</p>
                      {expense.note ? (
                        <p className="mt-1 text-sm text-neutral-500">{expense.note}</p>
                      ) : null}
                  </div>

                 <p className="font-bold">{formatCurrency(Number(expense.amount))}</p>
                </div>

                <div className="mt-4 flex gap-3">
                <Link
                    href={`/expenses/${expense.id}/edit`}
                    className="text-sm text-neutral-600 underline hover:text-neutral-900"
                  >
                    Editar
                  </Link>
                </div>
              </div>

              // <div
              //   key={expense.id}
              //   className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              // >
              //   <div className="flex items-start justify-between gap-4">
              //     <div>
              //       <p className="font-semibold">{expense.category}</p>
              //       <p className="text-sm text-neutral-600">{expense.date}</p>
              //       {expense.note ? (
              //         <p className="mt-1 text-sm text-neutral-500">
              //           {expense.note}
              //         </p>
              //       ) : null}
              //     </div>

              //     <p className="font-bold">
              //       {formatCurrency(Number(expense.amount))}
              //     </p>
              //   </div>
              // </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
