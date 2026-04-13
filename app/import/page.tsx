"use client";

import Link from "next/link";
import { useState } from "react";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/client";

type ParsedExpense = {
  date: string;
  category: string;
  amount: string;
  note?: string;
};
type InvalidRow = {
  index: number;
  reason: string;
  row: ParsedExpense;
};

export default function ImportPage() {
  const supabase = createClient();

    const [rows, setRows] = useState<ParsedExpense[]>([]);
    const [invalidRows, setInvalidRows] = useState<InvalidRow[]>([]);
    const [message, setMessage] = useState("");
    const [isImporting, setIsImporting] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    Papa.parse<ParsedExpense>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedRows = results.data;

        const invalid: InvalidRow[] = parsedRows
            .map((row, index) => {
                if (!row.date?.trim()) {
                 return { index: index + 1, reason: "Falta la fecha", row };
                }

                if (!row.category?.trim()) {
                 return { index: index + 1, reason: "Falta la categoría", row };
                }

                if (!row.amount?.trim()) {
                 return { index: index + 1, reason: "Falta el importe", row };
                }

                if (Number.isNaN(Number(row.amount))) {
                 return { index: index + 1, reason: "El importe no es válido", row };
                }

                return null;
            })
            .filter((item): item is InvalidRow => item !== null);

        setRows(parsedRows);
        setInvalidRows(invalid);

        if (invalid.length > 0) {
            setMessage(
                `Archivo cargado con ${parsedRows.length} filas, pero hay ${invalid.length} filas inválidas.`
            );
        } else {
            setMessage(`Archivo cargado: ${parsedRows.length} filas válidas.`);
        }
    },

      error: () => {
        setMessage("No se pudo leer el archivo CSV.");
      },
    });
  }

  async function handleImport() {
    if (rows.length === 0) {
      setMessage("No hay filas para importar.");
      return;
    }

    setIsImporting(true);
    setMessage("Importando gastos...");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("No hay sesión activa.");
      setIsImporting(false);
      return;
    }

    const preparedRows = rows.map((row) => ({
      user_id: user.id,
      date: row.date,
      category: row.category,
      amount: Number(row.amount),
      note: row.note?.trim() ? row.note : null,
    }));

    const { error } = await supabase.from("expenses").insert(preparedRows);

    if (error) {
      setMessage("Error al importar los gastos.");
      setIsImporting(false);
      return;
    }

    setMessage(`Importación completada ✅ (${preparedRows.length} gastos)`);
    setRows([]);
    setIsImporting(false);
  }
return (
    <main className="min-h-screen bg-neutral-50 p-6 text-neutral-900">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-neutral-600 hover:text-neutral-900"
        >
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold">Importar gastos</h1>
        <p className="mt-2 text-sm text-neutral-600">
            Sube un archivo CSV con columnas: <strong>date</strong>,{" "}
            <strong>category</strong>, <strong>amount</strong>, <strong>note</strong>.
        </p>

        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium">Formato esperado</p>
        <p className="mt-2 text-sm text-neutral-600">
            El archivo debe incluir estas columnas:
        </p>

        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-600">
            <li><strong>date</strong>: fecha en formato YYYY-MM-DD</li>
            <li><strong>category</strong>: categoría del gasto</li>
            <li><strong>amount</strong>: importe numérico</li>
            <li><strong>note</strong>: nota opcional</li>
        </ul>

        <div className="mt-4 rounded-xl bg-neutral-100 p-3 text-xs text-neutral-700 overflow-x-auto">
            <pre>{`date,category,amount,note
        2026-04-10,🛒 Mercado,32.50,Compra semanal
        2026-04-11,☕️ Café,1.80,Café por la mañana`}</pre>
        </div>
        <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                `date,category,amount,note
            2026-04-10,🛒 Mercado,32.50,Compra semanal
            2026-04-11,☕️ Café,1.80,Café por la mañana`
                )}`}
                download="ejemplo-gastos.csv"
                className="mt-4 inline-block rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100"
            >
                Descargar CSV de ejemplo
        </a>
        </div>


        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <label className="block text-sm font-medium">Archivo CSV</label>

        <label className="mt-3 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center hover:bg-neutral-100">
            <span className="text-sm text-neutral-600">
                Haz clic aquí para seleccionar un archivo CSV
            </span>

            <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            />
        </label>

          {message ? (
            <p className="mt-4 text-sm text-neutral-600">{message}</p>
          ) : null}
          {invalidRows.length > 0 ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">
                    Hay filas con errores en el archivo:
                </p>

                <ul className="mt-2 space-y-1 text-sm text-red-600">
                {invalidRows.slice(0, 5).map((item) => (
                    <li key={item.index}>
                        Fila {item.index}: {item.reason}
                    </li>
                    ))}
                </ul>

                {invalidRows.length > 5 ? (
                    <p className="mt-2 text-xs text-red-500">
                         Mostrando solo los primeros 5 errores.
                    </p>
                ) : null}
            </div>
        ) : null}

        </div>

        {rows.length > 0 ? (
          <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Vista previa</h2>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left">
                    <th className="py-2 pr-4">Fecha</th>
                    <th className="py-2 pr-4">Categoría</th>
                    <th className="py-2 pr-4">Importe</th>
                    <th className="py-2 pr-4">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-b border-neutral-100">
                      <td className="py-2 pr-4">{row.date}</td>
                      <td className="py-2 pr-4">{row.category}</td>
                      <td className="py-2 pr-4">{row.amount}</td>
                      <td className="py-2 pr-4">{row.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-neutral-500">
              Mostrando las primeras 10 filas del archivo.
            </p>

            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting}
              className="mt-6 rounded-xl bg-neutral-900 px-4 py-3 text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {isImporting ? "Importando..." : "Importar gastos"}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}

