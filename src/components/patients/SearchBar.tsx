"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { inputClass } from "@/components/ui/primitives";

export function SearchBar({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  // Debounced navigation so the list filters as you type.
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set("q", value.trim());
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/");
    }, 250);
    return () => clearTimeout(t);
  }, [value, router]);

  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name or phone"
        className={`${inputClass} pl-10`}
        type="search"
        inputMode="search"
        aria-label="Search patients"
      />
    </div>
  );
}
