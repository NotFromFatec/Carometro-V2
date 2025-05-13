// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { Container } from 'react-bootstrap'; 
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
import Home from './components/Home'; 
import PublicHome from './components/PublicHome';
import Search from './components/Search';
import ProfileView from './components/ProfileView';
import EditProfile from './components/EditProfile';
import AdminDashboard from './components/AdminDashboard';
import NavbarComponent from './components/NavbarComponent';
import AlertComponent from './components/Alert';
import AdminLogin from './components/AdminLogin';
import CreateAdmin from './components/CreateAdmin';
import Sitemap from './components/Sitemap';
import Footer from './components/Footer'; 
import { useAppContext } from './AppContext';

const App: React.FC = () => {
    const [alert, setAlert] = useState<{ message: string; variant: string } | null>(null);
    const { isLoggedIn, isAdminLoggedIn, loading: contextLoading, firstLogin  } = useAppContext(); 

    const showAlert = (message: string, variant: string = 'success') => {
        setAlert({ message, variant });
        setTimeout(() => setAlert(null), 4000);
    };

    const hideAlert = () => setAlert(null);
    const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);

    useEffect(() => {
        if (!contextLoading) {
            setInitialAuthCheckComplete(true);
        }
    }, [contextLoading]);

    if (!initialAuthCheckComplete) {
        return <div className="loading-fullscreen"><div className="spinner-border text-primary" role="status"></div><p className="mt-2">Carregando Aplicação...</p></div>;
    }

    return (
        <Router>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}> {/* Wrapper for sticky footer */}
                <NavbarComponent showAlert={showAlert} />
                <main className="main-content-wrapper container-fluid flex-grow-1"> {/* main takes available space */}
                    {alert && (
                        <AlertComponent
                            message={alert.message}
                            variant={alert.variant as any} 
                            onClose={hideAlert}
                        />
                    )}
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : isAdminLoggedIn ? <Navigate to="/admin" /> : <PublicHome />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/profile/:id" element={<ProfileView />} />
                        <Route path="/sitemap" element={<Sitemap />} />

                        {/* Auth Routes */}
                        <Route
                            path="/login"
                            element={
                                isLoggedIn ? (firstLogin ? <Navigate to="/edit-profile" /> : <Navigate to="/home" />)
                                : isAdminLoggedIn ? (<Navigate to="/admin" />)
                                : (<Login showAlert={showAlert} />)
                            }
                        />
                        <Route path="/create-account" element={isLoggedIn || isAdminLoggedIn ? <Navigate to="/" /> : <CreateAccount showAlert={showAlert} />} />
                        
                        {/* Protected Egresso Routes */}
                        <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
                        <Route path="/edit-profile" element={isLoggedIn ? <EditProfile showAlert={showAlert} /> : <Navigate to="/login" />} />

                        {/* Admin Routes */}
                        <Route path="/admin-login" element={isAdminLoggedIn ? <Navigate to="/admin" /> : <AdminLogin showAlert={showAlert} />} />
                        {/* AdminDashboard now handles /admin and its sub-routes like /admin/users */}
                        <Route path="/admin/*" element={isAdminLoggedIn ? <AdminDashboard showAlert={showAlert} /> : <Navigate to="/admin-login" />} />
                        <Route path="/create-admin" element={isAdminLoggedIn ? <Navigate to="/admin" /> : <CreateAdmin showAlert={showAlert} /> } />


                        <Route path="*" element={
                            <Container className="text-center py-5">
                                <h1 className="display-1 fw-bold text-primary">404</h1>
                                <p className="lead text-muted mb-4">Oops! A página que você está procurando não foi encontrada.</p>
                                <Link to="/" className="btn btn-primary btn-lg btn-modern">Voltar para o Início</Link>
                            </Container>
                        } />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;