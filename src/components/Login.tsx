// src/components/Login.tsx
import React, { useState } from 'react'; 
import { api } from '../api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { useAppContext } from '../AppContext';

interface LoginProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}

const Login: React.FC<LoginProps> = ({ showAlert }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const { loginEgresso, loading: contextLoading, setLoading, firstLogin } = useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        setLoading(true);
        try {
            const user = await api.loginUser(username, password);
            if (user) {
                const searchParams = new URLSearchParams(location.search);
                const isFirstLogin = searchParams.get('firstLogin') === 'true' || firstLogin; 
                loginEgresso(user, isFirstLogin);

                if (isFirstLogin) {
                    navigate('/edit-profile', { replace: true });
                } else {
                    const from = location.state?.from?.pathname || '/home';
                    navigate(from, { replace: true });
                }
            } else {
                setError('Falha no login. Nome de usuário ou senha inválidos.');
                showAlert('Falha no login. Nome de usuário ou senha inválidos.', 'danger');
            }
        } catch (err) {
            setError('Ocorreu um erro durante o login. Tente novamente.');
            showAlert('Ocorreu um erro durante o login.', 'danger');
            console.error("Login error:", err);
        }
        finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    return (
        <Container className="auth-card-container">
            {contextLoading && !isSubmitting ? ( // Show general loading if context is loading but not during submit action
                <div className="text-center"><div className="spinner-border text-primary"></div><p>Carregando...</p></div>
            ) : (
                <Row className="justify-content-center w-100">
                    <Col xs={12} md={10} lg={8} xl={6}> 
                        <Card className="modern-card auth-card shadow-lg"> 
                            <Card.Body>
                                <h2 className="card-title text-center">Entrar no Carômetro</h2>
                                {error && <p className="text-danger text-center small mb-3">{error}</p>}
                                <Form onSubmit={handleLogin}>
                                    <Form.Group className="mb-3" controlId="formBasicUsername">
                                        <Form.Label className="fw-medium">Nome de Usuário</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Seu nome de usuário"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="form-control-modern"
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label className="fw-medium">Senha</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Sua senha"
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
                                            {isSubmitting ? 'Entrando...' : 'Entrar'}
                                        </Button>
                                        {/* @ts-ignore */}
                                        <Button variant="link" as={Link} to="/create-account" className="text-center fw-medium">
                                            Não tem uma conta? Criar agora
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

export default Login;