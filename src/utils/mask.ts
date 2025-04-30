export function maskCpf(value: string): string {
  value = value.replace(/\D/g, "");

  return value
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function unMaskNumbers(value: string): string {
  return value.replace(/\D/g, "");
}
