const numberEs = new Intl.NumberFormat('es');

export function formatCount(value: number): string {
  return numberEs.format(value);
}
