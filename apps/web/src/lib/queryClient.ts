import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5_000,        // 5 seconds
      gcTime: 5 * 60 * 1_000, // 5 minutes
      retry: 1,
    },
  },
});
