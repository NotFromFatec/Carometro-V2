// src/components/CreateAccount.tsx
import React, { useState, useEffect } from 'react';
import { api, EgressoData } from '../api';
import { useNavigate, Link, useLocation } from 'react-router-dom'; 
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import TermsOfConsent from './TermsOfConsent';
import { useAppContext } from '../AppContext';

interface CreateAccountProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}

const CreateAccount: React.FC<CreateAccountProps> = ({ showAlert }) => {
    const [formData, setFormData] = useState<EgressoData>({
        name: '',
        profileImage: '', // Keep for consistency, but not used
        faceImage: '',
        facePoints: '',
        course: '',
        graduationYear: '',
        personalDescription: '',
        contactLinks: [],
        verified: false,
        username: '',
        passwordHash: '',
        careerDescription: '',
        termsAccepted: false,
    });
    const [error, setError] = useState('');
    const [inviteCode, setInviteCode] = useState(''); // Keep, but initialize from URL
    const [showTerms, setShowTerms] = useState(false);
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // Get location

    const { loading, setLoading } = useAppContext();

    // Apply invite code from URL on initial load
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const invite = searchParams.get('invite');
        if (invite) {
            setInviteCode(invite);
        }
    }, [location.search]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handlePasswordConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordConfirmation(e.target.value);
    };


    const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, termsAccepted: e.target.checked });
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        setIsSubmitting(true); 
        setLoading(true);
        try {
            if (!formData.username || !formData.passwordHash || !formData.name) {
                setError("Nome de usuário, senha e nome são obrigatórios.");
                showAlert("Nome de usuário, senha e nome são obrigatórios.", 'danger');
                return;
            }

            if (!formData.termsAccepted) {
                setError("Você deve aceitar os termos de consentimento.");
                showAlert("Você deve aceitar os termos de consentimento.", 'danger');
                return;
            }
            if (!inviteCode) {
                setError("Um código de convite é obrigatório.");
                showAlert("Um código de convite é obrigatório.", 'danger');
                return;
            }
            if (formData.passwordHash !== passwordConfirmation) {
                setError("As senhas não coincidem.");
                showAlert("As senhas não coincidem.", 'danger');
                return;
            }

            const newUser = await api.createUser(formData, inviteCode);
            if (newUser) {
                showAlert("Conta criada com sucesso! Redirecionando...", 'success');
                navigate('/login?firstLogin=true', { replace: true }); 

            } else {
                setError('Falha ao criar a conta.');
                showAlert('Falha ao criar a conta.', 'danger');
            }
        } finally {
            setIsSubmitting(false); 
            setLoading(false);
        }
    };


    return (
        <Container className="auth-card-container">
            {loading ? (
                <div>Carregando...</div>
            ) : (
                <Row className="justify-content-center w-100">
                    <Col xs={12} sm={10} md={8} lg={6}>
                        <Card className="modern-card auth-card shadow-lg">
                            <Card.Body>
                                <h2 className="text-center mb-4">Criar Conta</h2>
                                {error && <p className="text-danger text-center">{error}</p>}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3" controlId="formBasicName">
                                        <Form.Label>Nome</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            placeholder="Seu Nome"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicUsername">
                                        <Form.Label>Nome de Usuário <span style={{
                                            fontSize: "12px",
                                            color: "gray",
                                        }}>(Login Apenas)</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            placeholder="Nome de Usuário"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label>Senha</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                name="passwordHash"
                                                placeholder="Senha"
                                                value={formData.passwordHash}
                                                onChange={handleChange}
                                                required
                                            />
                                            <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? "Ocultar" : "Mostrar"}
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formConfirmPassword">
                                        <Form.Label>Confirmar Senha</Form.Label>
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="Confirme a Senha"
                                            value={passwordConfirmation}
                                            onChange={handlePasswordConfirmationChange}
                                            required
                                        />

                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicInviteCode">
                                        <Form.Label>Código de Convite</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="inviteCode"
                                            placeholder="Código de Convite"
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicTerms">
                                        <Form.Check
                                            type="checkbox"
                                            name="termsAccepted"
                                            label={(
                                                <>
                                                    Eu concordo com os{" "}
                                                    <a href="#!" onClick={(e) => {
                                                        e.preventDefault();
                                                        setShowTerms(true);
                                                    }}>
                                                        Termos de Consentimento
                                                    </a>{" "}
                                                    para o uso dos meus dados neste projeto.
                                                </>
                                            )}
                                            checked={formData.termsAccepted}
                                            onChange={handleTermsChange}
                                            required
                                        />
                                    </Form.Group>

                                    <div className="d-grid gap-2">
                                        <Button variant="success" type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Criando...' : 'Criar Conta'}
                                        </Button>
                                        {/* @ts-ignore */}
                                        <Button variant="link" as={Link} to="/login" className="text-center">
                                            Entrar
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
            <TermsOfConsent show={showTerms} onHide={() => setShowTerms(false)} />
        </Container>
    );
};

export default CreateAccount;