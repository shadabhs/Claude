import * as React from "react";

// Shared class strings for consistent mobile-friendly form controls.
export const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 " +
  "placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 " +
  "focus:ring-primary/30 transition";

export const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label ? <label className={labelClass}>{label}</label> : null}
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = "", ...props }, ref) {
  return <input ref={ref} className={`${inputClass} ${className}`} {...props} />;
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`${inputClass} min-h-[84px] resize-y ${className}`}
      {...props}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = "", children, ...props }, ref) {
  return (
    <select ref={ref} className={`${inputClass} ${className}`} {...props}>
      {children}
    </select>
  );
});

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
