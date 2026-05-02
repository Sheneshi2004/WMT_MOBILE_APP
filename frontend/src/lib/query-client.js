import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // 1 minute – data considered fresh
      gcTime: 5 * 60 * 1000,     // 5 minutes – cache duration
      retry: 1,                   // Retry once on failure
      refetchOnWindowFocus: false, // Don't refetch when app comes to foreground
      refetchOnReconnect: true,    // Refetch when network reconnects
    },
    mutations: {
      retry: 0,                   // Don't retry mutations
    },
  },
});