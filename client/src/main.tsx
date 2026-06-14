import './instrument'; // Sentry must be imported first
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,   // 기본 5분
      gcTime: 1000 * 60 * 10,     // 캐시 유지 10분
      refetchOnWindowFocus: false, // 탭 전환 시 불필요한 재요청 방지
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
