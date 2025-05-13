// src/components/ProfileView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, Egresso } from '../api';
import { Container, Row, Col, Image, ListGroup, Badge, Button, Alert as BootstrapAlert, Card } from 'react-bootstrap';
import { useAppContext } from '../AppContext';

const ProfileView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [egresso, setEgresso] = useState<Egresso | null>(null);
    const [error, setError] = useState('');
    const { egressoUser: currentEgressoUser, adminUser, isLoggedIn, isAdminLoggedIn } = useAppContext();
    const navigate = useNavigate();
    const [isVerifyingByAdmin, setIsVerifyingByAdmin] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        const fetchEgresso = async () => {
            setLoadingProfile(true);
            setError('');
            if (!id) {
                setError('ID de perfil inválido.');
                setLoadingProfile(false);
                navigate('/search');
                return;
            }

            try {
                const fetchedEgresso = await api.getEgresso(id);
                if (fetchedEgresso) {
                    if (fetchedEgresso.verified ||
                        (currentEgressoUser && fetchedEgresso.id === currentEgressoUser.id) ||
                        adminUser) {
                        setEgresso(fetchedEgresso);
                    } else {
                        setError('Você não tem permissão para ver este perfil ou o perfil não está verificado.');
                    }
                } else {
                    setError('Perfil não encontrado.');
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError('Erro ao carregar o perfil.');
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchEgresso();
    }, [id, currentEgressoUser, adminUser, navigate]);

    const handleVerifyUnverifyByAdmin = async () => {
        if (adminUser && egresso && egresso.id) {
            setIsVerifyingByAdmin(true);
            try {
                const updatedEgresso = await api.updateEgresso(egresso.id, { verified: !egresso.verified });
                if (updatedEgresso) {
                    setEgresso(new Egresso(updatedEgresso.toJson()));
                } else {
                    alert('Falha ao verificar/remover verificação.');
                }
            } catch (err) {
                console.error("Error verifying by admin:", err);
                alert('Erro ao atualizar status de verificação.');
            }
            finally {
                setIsVerifyingByAdmin(false);
            }
        }
    };

    if (loadingProfile) {
        return <Container className="text-center p-5"><div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status"></div><p className="mt-3 lead">Carregando perfil...</p></Container>;
    }

    if (error && !egresso) {
        return (
            <Container className="text-center p-5 profile-view-container">
                <BootstrapAlert variant="danger" className="modern-alert lead">{error}</BootstrapAlert>
                <Link to="/search" className="btn btn-primary btn-modern mt-3">Voltar para Busca</Link>
            </Container>
        );
    }

    if (!egresso) {
        return (
            <Container className="text-center p-5 profile-view-container">
                <BootstrapAlert variant="warning" className="modern-alert lead">Perfil não disponível.</BootstrapAlert>
                <Link to="/search" className="btn btn-primary btn-modern mt-3">Voltar para Busca</Link>
            </Container>
        );
    }

    const canEdit = isLoggedIn && currentEgressoUser?.id === egresso.id;

    return (
        <Container className="p-md-4 profile-view-container">
            <Card className="modern-card shadow-lg mb-4"> 
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={4} lg={3} className="text-center mb-3 mb-md-0">
                            <Image
                                src={egresso.profileImage || "/placeholder.png"}
                                alt={`Foto de ${egresso.name}`}
                                roundedCircle
                                className="profile-image" 
                            />
                        </Col>
                        <Col md={8} lg={9}>
                            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between mb-2">
                                <h1 className="profile-name mb-1 me-md-3">{egresso.name}</h1>
                                {canEdit && (
                                    // @ts-ignore
                                    <Button as={Link} to="/edit-profile" variant="outline-primary" size="sm" className="btn-modern align-self-start align-self-md-center">
                                        Editar Meu Perfil
                                    </Button>
                                )}
                            </div>
                            <p className="text-muted fs-6 mb-2">
                                {egresso.course || "Curso não especificado"}
                                {egresso.graduationYear && ` - Turma de ${egresso.graduationYear}`}
                            </p>
                            <div className="d-flex align-items-center">
                                <Badge pill bg={egresso.verified ? 'success' : 'danger'} className="badge-modern me-2">
                                    {egresso.verified ? 'Verificado' : 'Não Verificado'}
                                </Badge>
                                {isAdminLoggedIn && adminUser && (
                                    <Button
                                        variant={egresso.verified ? 'outline-warning' : 'outline-success'}
                                        size="sm"
                                        className="btn-modern"
                                        onClick={handleVerifyUnverifyByAdmin}
                                        disabled={isVerifyingByAdmin}
                                    >
                                        {isVerifyingByAdmin ? (egresso.verified ? "Processando..." : "Processando...") : (egresso.verified ? 'Remover Verificação' : 'Verificar Perfil')}
                                    </Button>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="modern-card shadow-sm mb-4">
                <Card.Header as="h4" className="section-title-card">Descrição Pessoal</Card.Header>
                <Card.Body>
                    <Card.Text>{egresso.personalDescription || <span className="text-muted fst-italic">Nenhuma descrição pessoal fornecida.</span>}</Card.Text>
                </Card.Body>
            </Card>

            <Card className="modern-card shadow-sm mb-4">
                <Card.Header as="h4" className="section-title-card">Trajetória Profissional</Card.Header>
                <Card.Body>
                    <Card.Text>{egresso.careerDescription || <span className="text-muted fst-italic">Nenhuma descrição de carreira fornecida.</span>}</Card.Text>
                </Card.Body>
            </Card>

            <Card className="modern-card shadow-sm">
                <Card.Header as="h4" className="section-title-card">Links de Contato</Card.Header>
                <ListGroup variant="flush"> 
                    {egresso.contactLinks && egresso.contactLinks.length > 0 && egresso.contactLinks.some(link => link.trim() !== '') ? (
                        egresso.contactLinks.filter(link => link.trim() !== '').map((link, index) => (
                            <ListGroup.Item key={index} action href={link.startsWith('http') ? link : `//${link}`} target="_blank" rel="noopener noreferrer" className="contact-link-item">
                                {link}
                            </ListGroup.Item>
                        ))
                    ) : (
                        <ListGroup.Item>
                            <p className="text-muted fst-italic mb-0">Nenhum link de contato fornecido.</p>
                        </ListGroup.Item>
                    )}
                </ListGroup>
            </Card>
        </Container>
    );
};

export default ProfileView;