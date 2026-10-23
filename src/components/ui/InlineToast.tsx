import { AlertCircle, CheckCircle2 } from "lucide-react";

import type { ToastMessage } from "@/types/database";

export function Toast({ toast }: { toast: ToastMessage | null }) {
  if (!toast) return null;

  return (
    <div
      className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl motion-safe:animate-enter duration-300 ${
        toast.type === "success"
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-md-error/10 text-md-error"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle2 size={15} />
      ) : (
        <AlertCircle size={15} />
      )}
      {toast.msg}
    </div>
  );
}
