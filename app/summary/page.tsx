import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function isSameDay(dateString: string, now: Date) {
  const date = new Date(dateString);
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isSameMonth(dateString: string, now: Date) {
  const date = new Date(dateString);
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function isSameWeek(dateString: string, now: Date) {
  const date = new Date(dateString);

  const current = new Date(now);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  const weekStart = new Date(current);
  weekStart.setDate(current.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return date >= weekStart && date <= weekEnd;
}

type SummaryPageProps = {
  searchParams: Promise<{
    period?: string;
  }>;
};

export default async function SummaryPage({
  searchParams,
}: SummaryPageProps) {
  const params = await searchParams;
  const period = params.period ?? "month";

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
    .eq("user_id", user.id);

  const now = new Date();

  const filteredExpenses =
    expenses?.filter((expense) => {
      if (period === "day") return isSameDay(expense.date, now);
      if (period === "week") return isSameWeek(expense.date, now);
      return isSameMonth(expense.date, now);
    }) ?? [];

  const total = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const totalCount = filteredExpenses.length;

  const grouped = filteredExpenses.reduce<Record<string, number>>(
    (acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] ?? 0) + Number(expense.amount);
      return acc;
    },
    {}
  );

  const sortedCategories = Object.entries(grouped).sort((a, b) => b[1] - a[1]);

  const topCategory = sortedCategories[0];
  const maxAmount = sortedCategories[0]?.[1] ?? 0;

  const periodLabel =
    period === "day" ? "hoy" : period === "week" ? "esta semana" : "este mes";

return (
    <main className="min-h-screen bg-neutral-50 p-6 text-neutral-900">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-neutral-600 hover:text-neutral-900"
        >
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold">Resumen</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Vista general de tus gastos de {periodLabel}.
        </p>

        <div className="mt-6 flex gap-2">
          <Link
            href="/summary?period=day"
            className={`rounded-xl px-4 py-2 text-sm ${
              period === "day"
                ? "bg-neutral-900 text-white"
                : "border border-neutral-300 bg-white hover:bg-neutral-100"
            }`}
          >
            Hoy
          </Link>

          <Link
            href="/summary?period=week"
            className={`rounded-xl px-4 py-2 text-sm ${
              period === "week"
                ? "bg-neutral-900 text-white"
                : "border border-neutral-300 bg-white hover:bg-neutral-100"
            }`}
          >
            Semana
          </Link>

          <Link
            href="/summary?period=month"
            className={`rounded-xl px-4 py-2 text-sm ${
              period === "month"
                ? "bg-neutral-900 text-white"
                : "border border-neutral-300 bg-white hover:bg-neutral-100"
            }`}
          >
            Mes
          </Link>
        </div>

        {error ? (
          <p className="mt-6 text-sm text-red-600">
            Ha habido un error al cargar el resumen.
          </p>
        ) : (
          <>
            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-neutral-500">Total gastado</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(total)}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-neutral-500">Número de gastos</p>
                <p className="mt-1 text-2xl font-bold">{totalCount}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-neutral-500">Categoría principal</p>
                <p className="mt-1 text-lg font-bold">
                  {topCategory ? topCategory[0] : "Sin datos"}
                </p>
                {topCategory ? (
                  <p className="mt-1 text-sm text-neutral-600">
                    {formatCurrency(topCategory[1])}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Gasto por categoría</h2>

              {sortedCategories.length === 0 ? (
                <p className="mt-4 text-sm text-neutral-600">
                  No hay gastos en este periodo.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {sortedCategories.map(([category, amount]) => {
                    const width =
                      maxAmount > 0 ? `${(amount / maxAmount) * 100}%` : "0%";

                    return (
                      <div key={category}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium">{category}</span>
                          <span className="text-neutral-600">
                            {formatCurrency(amount)}
                          </span>
                        </div>

                        <div className="h-3 rounded-full bg-neutral-200">
                          <div
                            className="h-3 rounded-full bg-neutral-900"
                            style={{ width }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

