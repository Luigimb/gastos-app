"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type DeleteExpenseButtonProps = {
  expenseId: string;
};

export default function DeleteExpenseButton({
  expenseId,
}: DeleteExpenseButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      "¿Seguro que quieres borrar este gasto?"
    );

    if (!confirmed) return;

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("user_id", user.id);

    if (error) {
      alert("No se pudo borrar el gasto.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-600 underline hover:text-red-700"
    >
      Borrar
    </button>
  );
}
