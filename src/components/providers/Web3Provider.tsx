import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '../../lib/web3/config';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
        refetchOnWindowFocus: true,
        // Memory-only cache; nothing is persisted between visits.
        gcTime: 5 * 60_000,
      },
    },
  });
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
