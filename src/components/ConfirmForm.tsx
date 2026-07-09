"use client";

// Wraps a server action in a form that asks for confirmation before submitting.
export function ConfirmForm({
  action,
  confirm,
  children,
  className = "",
}: {
  action: () => Promise<void>;
  confirm: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
