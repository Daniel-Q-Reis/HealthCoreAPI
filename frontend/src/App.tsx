import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingModule } from './modules/landing';
import { DQRHealthModule } from './modules/dqr-health';
import './index.css';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* Landing Page (Portfolio) */}
                    <Route path="/" element={<LandingModule />} />

                    {/* DQR Health Application */}
                    <Route path="/dqr-health/*" element={<DQRHealthModule />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
