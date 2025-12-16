import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { Dashboard } from './pages/Dashboard';
import { PatientsPage } from './pages/Patients';
import { AppointmentsPage } from './pages/Appointments';
import { PharmacyPage } from './pages/Pharmacy';
import { ExperiencePage } from './pages/Experience';

export const DQRHealthModule = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/pharmacy" element={<PharmacyPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
        </Routes>
    );
};
