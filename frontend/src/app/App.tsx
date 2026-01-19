import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/pages/landing';
import { DQRHealthRoutes } from '@/pages/dqr-health';
import '@/app/styles/index.css';

import { ThemeProvider } from '@/shared/contexts/ThemeContext';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

export function App() {
    return (
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Routes>
                        {/* Landing Page (Portfolio) */}
                        <Route path="/" element={<LandingPage />} />

                        {/* DQR Health Application */}
                        <Route path="/dqr-health/*" element={<DQRHealthRoutes />} />
                    </Routes>
                </BrowserRouter>
            </QueryClientProvider>
        </ThemeProvider>
    );
}
