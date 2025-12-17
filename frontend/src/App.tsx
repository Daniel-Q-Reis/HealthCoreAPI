import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingModule } from './modules/landing';
import { DQRHealthModule } from './modules/dqr-health';
import './index.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing Page (Portfolio) */}
                <Route path="/" element={<LandingModule />} />

                {/* DQR Health Application */}
                <Route path="/dqr-health/*" element={<DQRHealthModule />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
