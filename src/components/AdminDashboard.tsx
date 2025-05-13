// src/components/AdminDashboard.tsx
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useAppContext } from '../AppContext';
import AdminNav from './admin/AdminNav';
import AdminHomeView from './admin/AdminHomeView';
import AdminUsersView from './admin/AdminUsersView';
import AdminInvitesView from './admin/AdminInvitesView';
import AdminCoursesView from './admin/AdminCoursesView';
import AdminEmailView from './admin/AdminEmailView'; 

interface AdminDashboardProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ showAlert }) => {
    const { adminUser, loading: contextLoading } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!contextLoading && !adminUser?.id) {
            navigate('/admin-login');
        }
    }, [adminUser, contextLoading, navigate]);

    if (contextLoading) {
        return <Container className="text-center p-5"><div className="spinner-border text-primary" role="status"></div><p>Verificando sessão...</p></Container>;
    }

    if (!adminUser?.id) {
        return <Navigate to="/admin-login" replace />;
    }

    return (
        <Container fluid className="p-md-4 admin-dashboard-container">
            <h2 className="text-center mb-4 page-title">Painel de Administração</h2>
            <AdminNav />
            <div className="admin-content-area p-3 p-md-4 shadow rounded-3 bg-white">
                <Routes>
                    <Route index element={<AdminHomeView />} /> 
                    <Route path="users" element={<AdminUsersView showAlert={showAlert} />} />
                    <Route path="invites" element={<AdminInvitesView showAlert={showAlert} />} />
                    <Route path="courses" element={<AdminCoursesView showAlert={showAlert} />} />
                    <Route path="email" element={<AdminEmailView showAlert={showAlert} />} /> 
                </Routes>
                <Outlet /> {/* This is usually not needed if all routes are defined above */}
            </div>
        </Container>
    );
};

export default AdminDashboard;