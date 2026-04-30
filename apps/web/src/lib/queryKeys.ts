// Central queryKey factory — all TanStack Query keys live here.
// Pattern: qk.<domain>.<variant>(...args) → readonly tuple used as queryKey.

export const qk = {
  buildings: {
    all: () => ['buildings'] as const,
    byId: (id: string) => ['buildings', id] as const,
  },
  settlements: {
    list: (filter: Record<string, unknown>) => ['settlements', 'list', filter] as const,
  },
  anomalies: {
    all: () => ['anomalies'] as const,
  },
  txStream: {
    recent: () => ['txStream', 'recent'] as const,
  },
} as const;
