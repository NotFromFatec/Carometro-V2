// src/components/CreateAdmin.tsx
import React, { useState } from 'react';
import { api, AdminData } from '../api';
import { useNavigate, Link } from 'react-router-dom'; 
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { useAppContext } from '../AppContext';

interface CreateAdminProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}
const CreateAdmin: React.FC<CreateAdminProps> = ({ showAlert }) => {
    const [formData, setFormData] = useState<AdminData>({
        name: '',
        username: '',
        role: 'Administrator', // Default role
        passwordHash: '',
    });
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { loading: contextLoading, setLoading } = useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordConfirmation(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.passwordHash.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            showAlert("A senha deve ter pelo menos 6 caracteres.", 'warning');
            return;
        }
        if (formData.passwordHash !== passwordConfirmation) {
            setError("As senhas não coincidem.");
            showAlert("As senhas não coincidem.", 'danger');
            return;
        }
        if (!formData.name || !formData.username || !formData.role) {
            setError("Todos os campos são obrigatórios.");
            showAlert("Todos os campos são obrigatórios.", 'danger');
            return;
        }

        setIsSubmitting(true);
        setLoading(true);
        try {
            const newAdmin = await api.createAdmin(formData);
            if (newAdmin) {
                showAlert("Conta de administrador criada com sucesso! Faça login.", 'success');
                navigate('/admin-login'); // Navigate to admin login after creation
            } else {
                setError('Falha ao criar conta de administrador. O nome de usuário pode já existir.');
                showAlert('Falha ao criar administrador. Verifique os dados ou nome de usuário.', 'danger');
            }
        } catch (err) {
            setError('Ocorreu um erro ao criar a conta. Tente novamente.');
            showAlert('Ocorreu um erro ao criar a conta.', 'danger');
            console.error("Create admin error:", err);
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
                                <h2 className="card-title text-center">Criar Conta de Administrador</h2>
                                {error && <p className="text-danger text-center small mb-3">{error}</p>}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3" controlId="formAdminName">
                                        <Form.Label className="fw-medium">Nome Completo</Form.Label>
                                        <Form.Control
                                            type="text" name="name" placeholder="Nome do Administrador"
                                            value={formData.name} onChange={handleChange}
                                            className="form-control-modern" required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formAdminUsername">
                                        <Form.Label className="fw-medium">Nome de Usuário (para login)</Form.Label>
                                        <Form.Control
                                            type="text" name="username" placeholder="Escolha um nome de usuário"
                                            value={formData.username} onChange={handleChange}
                                            className="form-control-modern" required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formAdminRole">
                                        <Form.Label className="fw-medium">Cargo/Função</Form.Label>
                                        <Form.Control
                                            type="text" name="role" placeholder="Ex: Administrador Principal"
                                            value={formData.role} onChange={handleChange}
                                            className="form-control-modern" required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formAdminPassword">
                                        <Form.Label className="fw-medium">Senha</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"} name="passwordHash" placeholder="Crie uma senha forte"
                                                value={formData.passwordHash} onChange={handleChange}
                                                className="form-control-modern" required
                                            />
                                            <Button variant="outline-secondary" className="btn-modern" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? "Ocultar" : "Mostrar"}
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="formAdminConfirmPassword"> {/* Increased mb */}
                                        <Form.Label className="fw-medium">Confirmar Senha</Form.Label>
                                        <Form.Control
                                            type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirme sua senha"
                                            value={passwordConfirmation} onChange={handlePasswordConfirmationChange}
                                            className="form-control-modern" required
                                        />
                                    </Form.Group>

                                    <div className="d-grid gap-2">
                                        <Button variant="primary" type="submit" className="btn-modern" disabled={isSubmitting || contextLoading}>
                                            {isSubmitting ? 'Criando...' : 'Criar Conta Admin'}
                                        </Button>
                                        {/* @ts-ignore */}
                                        <Button variant="link" as={Link} to="/admin-login" className="text-center fw-medium">
                                            Já tem uma conta admin? Entrar
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

export default CreateAdmin;