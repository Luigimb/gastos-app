import LogoutButton from "@/components/logout-button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";


function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-neutral-50 text-neutral-900 p-6">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-bold">Gastos</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Tu app para registrar gastos sin depender del Excel.
          </p>

          <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-neutral-500">Estado</p>
            <p className="mt-1 font-medium">No has iniciado sesión</p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
            >
              Ir al login
            </Link>
          </div>
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

  const total =
    expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) ?? 0;

  const recentExpenses = expenses?.slice(0, 5) ?? [];
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 p-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold">Gastos</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Tu app para registrar gastos sin depender del Excel.
        </p>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-neutral-500">Sesión activa</p>
          <p className="mt-1 font-medium">{user.email}</p>
          <LogoutButton />
    
          <div className="mt-6 space-y-3">
            <Link
              href="/expenses/new"
              className="block rounded-xl bg-neutral-900 px-4 py-3 text-center text-white hover:bg-neutral-800"
            >
              Añadir gasto
            </Link>

            <Link
              href="/expenses"
              className="block rounded-xl border border-neutral-300 px-4 py-3 text-center hover:bg-neutral-100"
            >
              Ver gastos
            </Link>

            <Link
              href="/summary"
              className="block rounded-xl border border-neutral-300 px-4 py-3 text-center hover:bg-neutral-100"
            >
              Ver resumen
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-neutral-500">Total registrado</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(total)}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Últimos gastos</h2>
            <Link
              href="/expenses"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              Ver todo
            </Link>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-red-600">
              Ha habido un error al cargar los gastos.
            </p>
          ) : recentExpenses.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-600">
              Todavía no has añadido gastos.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 p-3"
                >
                  <div>
                    <p className="font-medium">{expense.category}</p>
                    <p className="text-sm text-neutral-600">{expense.date}</p>
                    {expense.note ? (
                      <p className="text-sm text-neutral-500">{expense.note}</p>
                    ) : null}
                  </div>

                  <p className="font-semibold">
                    {formatCurrency(Number(expense.amount))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// import Image from "next/image";

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-neutral-50 text-neutral-900 p-6">
//       <div className="mx-auto max-w-md">
//         <h1 className="text-3xl font-bold">Gastos</h1>
//         <p className="mt-2 text-sm text-neutral-600">
//           Tu app para registrar gastos sin depender del Excel.
//         </p>

//         <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
//           <p className="text-sm text-neutral-500">Estado</p>
//           <p className="mt-1 font-medium">Proyecto arrancado correctamente ✅</p>
//         </div>
//       </div>
//     </main>
//   );
// }

