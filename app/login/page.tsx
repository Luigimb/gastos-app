"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("Procesando...");

    if (isRegisterMode) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Cuenta creada correctamente. Ahora puedes iniciar sesión.");
      setIsRegisterMode(false);
      setPassword("");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Sesión iniciada ✅");
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 p-6">
      <div className="mx-auto mt-16 max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">
          {isRegisterMode ? "Crear cuenta" : "Iniciar sesión"}
        </h1>

        <p className="mt-2 text-sm text-neutral-600">
          {isRegisterMode
            ? "Crea tu cuenta para usar la app de gastos."
            : "Accede a tu app de gastos con email y contraseña."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-white hover:bg-neutral-800"
          >
            {isRegisterMode ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsRegisterMode((prev) => !prev);
            setMessage("");
            setPassword("");
          }}
          className="mt-4 text-sm text-neutral-600 underline hover:text-neutral-900"
        >
          {isRegisterMode
            ? "Ya tengo cuenta"
            : "No tengo cuenta, quiero registrarme"}
        </button>

        {message ? (
          <p className="mt-4 text-sm text-neutral-600">{message}</p>
        ) : null}
      </div>
    </main>
  );
}

