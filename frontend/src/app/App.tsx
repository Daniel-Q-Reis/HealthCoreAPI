import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/pages/landing';
import { DQRHealthRoutes } from '@/pages/dqr-health';
import '@/app/styles/index.css';

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing Page (Portfolio) */}
                <Route path="/" element={<LandingPage />} />

                {/* DQR Health Application */}
                <Route path="/dqr-health/*" element={<DQRHealthRoutes />} />
            </Routes>
        </BrowserRouter>
    );
}
