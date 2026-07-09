const SEX_LABEL: Record<string, string> = { M: "Male", F: "Female", O: "Other" };

export function sexLabel(sex: string): string {
  return SEX_LABEL[sex] ?? "";
}

export function sexShort(sex: string): string {
  return sex === "M" || sex === "F" || sex === "O" ? sex : "";
}

/** "34 y • Male" style subtitle. Returns "" if nothing to show. */
export function ageSexLine(ageYears: number | null, sex: string): string {
  const parts: string[] = [];
  if (ageYears != null) parts.push(`${ageYears} y`);
  const s = sexLabel(sex);
  if (s) parts.push(s);
  return parts.join(" • ");
}

export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
