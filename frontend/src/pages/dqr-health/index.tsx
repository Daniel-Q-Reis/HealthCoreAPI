import { Routes, Route } from 'react-router-dom';
import { HomePage } from './home';
import { DashboardPage } from './dashboard';
import { PatientsPage } from './patients';
import { AppointmentsPage } from './appointments';
import { PharmacyPage } from './pharmacy';
import { ExperiencePage } from './experience';
import { ComponentShowcase } from './showcase';

export function DQRHealthRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/pharmacy" element={<PharmacyPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/showcase" element={<ComponentShowcase />} />
        </Routes>
    );
}
