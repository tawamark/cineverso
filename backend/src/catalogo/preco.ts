export function precoComDesconto(
  precoBaseCentavos: number,
  descontoPercentual: number,
): number {
  return Math.round((precoBaseCentavos * (100 - descontoPercentual)) / 100);
}
