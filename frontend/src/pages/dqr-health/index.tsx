import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './home';
import { DashboardPage } from './dashboard';
import { PatientsPage } from './patients';
import { AppointmentsPage } from './appointments';
import { ResultsPage } from './results';
// import { PharmacyPage } from './pharmacy'; // Removed placeholder
import { ExperiencePage } from './experience';
import { PharmacyLayout } from '@/features/pharmacy/layouts/PharmacyLayout';
import { InventoryPage } from '@/features/pharmacy/pages/InventoryPage';
import { DispensePage } from '@/features/pharmacy/pages/DispensePage';
import { ComponentShowcase } from './showcase';
import {
    LoginPage,
    RegisterPage,
    RequestProfessionalAccess,
    OAuthCallbackPage,
    AdminCredentialDashboard
} from '@/features/auth/pages';
import { ProviderSearchPage } from '@/features/scheduling/pages/ProviderSearchPage';
import { AuthProvider } from '@/features/auth/context/AuthProvider';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { PatientsVisitorsPage, HealthResourcesPage, UnitsAndFloorsPage } from '@/features/medical-center';

export function DQRHealthRoutes() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth/callback" element={<OAuthCallbackPage />} />

                {/* Protected Routes */}
                <Route
                    path="/request-access"
                    element={
                        <ProtectedRoute>
                            <RequestProfessionalAccess />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/credentials"
                    element={
                        <ProtectedRoute requiredRoles={['Admins']}>
                            <AdminCredentialDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route
                    path="/schedule"
                    element={
                        <ProtectedRoute>
                            <ProviderSearchPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/results"
                    element={
                        <ProtectedRoute>
                            <ResultsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Pharmacy Module */}
                <Route
                    path="/pharmacy"
                    element={
                        <ProtectedRoute requiredRoles={['Doctors', 'Nurses', 'Pharmacists', 'Admins']}>
                            <PharmacyLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="inventory" replace />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="dispense" element={<DispensePage />} />
                </Route>

                <Route path="/experience" element={<ExperiencePage />} />
                <Route path="/experience" element={<ExperiencePage />} />
                <Route path="/showcase" element={<ComponentShowcase />} />

                {/* Public Medical Center Info */}
                <Route path="/patients-visitors" element={<PatientsVisitorsPage />} />
                <Route path="/health-resources" element={<HealthResourcesPage />} />
                <Route path="/units" element={<UnitsAndFloorsPage />} />
            </Routes>
        </AuthProvider>
    );
}
