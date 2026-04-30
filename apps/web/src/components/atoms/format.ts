export const fmt = {
  n: (n: number | undefined, d = 0): string =>
    n?.toLocaleString('ko-KR', {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    }) ?? '',
  won: (n: number | undefined): string =>
    (n?.toLocaleString('ko-KR') ?? '') + '원',
  kwh: (n: number | undefined, d = 1): string =>
    n?.toLocaleString('ko-KR', {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    }) ?? '',
};
