import { Routes, Route } from 'react-router-dom';
import { HomePage } from './home';
import { DashboardPage } from './dashboard';
import { PatientsPage } from './patients';
import { AppointmentsPage } from './appointments';
import { PharmacyPage } from './pharmacy';
import { ExperiencePage } from './experience';
import { ComponentShowcase } from './showcase';
import {
    LoginPage,
    RegisterPage,
    RequestProfessionalAccess,
    OAuthCallbackPage,
    AdminCredentialDashboard
} from '@/features/auth/pages';
import { AuthProvider } from '@/features/auth/context/AuthProvider';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

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
                <Route path="/pharmacy" element={<PharmacyPage />} />
                <Route path="/experience" element={<ExperiencePage />} />
                <Route path="/showcase" element={<ComponentShowcase />} />
            </Routes>
        </AuthProvider>
    );
}
