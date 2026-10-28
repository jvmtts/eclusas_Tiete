export const digits = (value: unknown): string =>
  String(value ?? "").replace(/\D/g, "");
export const clean = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

export function formatDate(value: string | undefined): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? "")
    ? value!.split("-").reverse().join("/")
    : (value ?? "");
}

export function formatBytes(value: number): string {
  return value < 1024 * 1024
    ? `${Math.max(1, Math.round(value / 1024))} KB`
    : `${(value / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export function maskValue(name: string, raw: string): string {
  if (["cpf", "companionCpf"].includes(name))
    return digits(raw)
      .slice(0, 11)
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  if (["phone", "emergencyPhone"].includes(name)) {
    const value = digits(raw).slice(0, 11);
    if (value.length <= 2) return value;
    const local = value.slice(2);
    const split = local.length > 8 ? 5 : 4;
    return `(${value.slice(0, 2)}) ${local.slice(0, split)}${local.length > split ? `-${local.slice(split)}` : ""}`;
  }
  if (name === "zip")
    return digits(raw)
      .slice(0, 8)
      .replace(/(\d{5})(\d)/, "$1-$2");
  if (name === "year") return digits(raw).slice(0, 4);
  return raw;
}

export function localDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
