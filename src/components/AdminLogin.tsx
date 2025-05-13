// src/components/AdminLogin.tsx
import React, { useState } from 'react';
import { api } from '../api';
import { useNavigate, useLocation, Link } from 'react-router-dom'; 
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { useAppContext } from '../AppContext';

interface AdminLoginProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ showAlert }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { loginAdmin, loading: contextLoading, setLoading } = useAppContext();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        setLoading(true);
        try {
            const admin = await api.loginAdmin(username, password);
            if (admin) {
                loginAdmin(admin);
                const from = location.state?.from?.pathname || '/admin/users'; // Default to users view
                navigate(from, { replace: true });
            } else {
                setError('Login de administrador falhou. Verifique nome de usuário e senha.');
                showAlert('Login de administrador falhou. Verifique nome de usuário e senha.', 'danger');
            }
        } catch (err) {
            setError('Ocorreu um erro durante o login. Tente novamente.');
            showAlert('Ocorreu um erro durante o login.', 'danger');
            console.error("Admin login error:", err);
        }
        finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    return (
        <Container className="auth-card-container">
            {contextLoading && !isSubmitting ? (
                <div className="text-center"><div className="spinner-border text-primary"></div><p>Carregando...</p></div>
            ) : (
                <Row className="justify-content-center w-100">
                    <Col xs={12} md={10} lg={8} xl={6}>
                        <Card className="modern-card auth-card shadow-lg">
                            <Card.Body>
                                <h2 className="card-title text-center">Login de Administrador</h2>
                                {error && <p className="text-danger text-center small mb-3">{error}</p>}
                                <Form onSubmit={handleLogin}>
                                    <Form.Group className="mb-3" controlId="formAdminUsername">
                                        <Form.Label className="fw-medium">Nome de Usuário</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Seu nome de usuário admin"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="form-control-modern"
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formAdminPassword">
                                        <Form.Label className="fw-medium">Senha</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Sua senha admin"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="form-control-modern"
                                                required
                                            />
                                            <Button variant="outline-secondary" className="btn-modern" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? "Ocultar" : "Mostrar"}
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>

                                    <div className="d-grid gap-2 mt-4">
                                        <Button variant="primary" type="submit" className="btn-modern" disabled={isSubmitting || contextLoading}>
                                            {isSubmitting ? 'Entrando...' : 'Entrar como Admin'}
                                        </Button>
                                        {/* @ts-ignore */}
                                        <Button variant="link" as={Link} to="/login" className="text-center fw-medium">
                                            Login de Egresso
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default AdminLogin;