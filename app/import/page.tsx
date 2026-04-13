"use client";

import Link from "next/link";
import { useState } from "react";
import Papa from "papaparse";

type ParsedExpense = {
  date: string;
  category: string;
  amount: string;
  note?: string;
};

export default function ImportPage() {
  const [rows, setRows] = useState<ParsedExpense[]>([]);
  const [message, setMessage] = useState("");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    Papa.parse<ParsedExpense>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setRows(results.data);
        setMessage(`Archivo cargado: ${results.data.length} filas detectadas.`);
      },
      error: () => {
        setMessage("No se pudo leer el archivo CSV.");
      },
    });
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
          Sube un archivo CSV con columnas: date, category, amount, note
        </p>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <label className="block text-sm font-medium">Archivo CSV</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mt-3 block w-full text-sm"
          />

          {message ? (
            <p className="mt-4 text-sm text-neutral-600">{message}</p>
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
          </div>
        ) : null}
      </div>
    </main>
  );
}
