"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "",
  pendingText,
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary " +
        "px-4 py-3 font-semibold text-white shadow-sm transition active:scale-[0.99] " +
        "hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed " +
        className
      }
    >
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
