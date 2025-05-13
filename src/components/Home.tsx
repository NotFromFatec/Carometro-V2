// src/components/PublicHome.tsx
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Placeholder } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { api, Egresso } from '../api';

const PublicHome: React.FC = () => {
    const [recentEgressos, setRecentEgressos] = useState<Egresso[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        api.getEgressos()
            .then(allEgressos => {
                const verifiedEgressos = allEgressos.filter(e => e.verified);
                verifiedEgressos.sort((a, b) => (b.id! > a.id!) ? 1 : -1); 
                setRecentEgressos(verifiedEgressos.slice(0, 6));
            })
            .catch(error => {
                console.error("Error fetching recent egressos:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = searchTerm.trim();
        if (trimmedQuery) {
            navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
        } else {
            navigate('/search');
        }
    };

    return (
        <>
            <Container className="p-md-4 public-home-container">
                <div className="text-center my-4 my-md-5">
                    <h1 className="display-4 fw-bold page-title">Bem-vindo ao Carômetro</h1>
                    <p className="lead text-muted">Encontre e conecte-se com egressos da nossa instituição.</p>
                </div>

                <Form onSubmit={handleSearchSubmit} className="mb-5">
                    <Row className="justify-content-center">
                        <Col xs={12} md={8} lg={6}>
                            <Form.Control
                                type="text"
                                placeholder="Buscar egressos por nome, curso..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="lg"
                                className="form-control-modern shadow-sm"
                            />
                        </Col>
                        <Col xs="auto" className="mt-2 mt-md-0">
                            <Button variant="primary" type="submit" size="lg" className="btn-modern shadow-sm">
                                Buscar
                            </Button>
                        </Col>
                    </Row>
                </Form>

                <h2 className="mb-4 section-title">Egressos Verificados Recentemente</h2>
                {loading ? (
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <Col key={idx}>
                                <Card className="shadow-sm modern-card">
                                    <Card.Body>
                                        <Placeholder as={Card.Title} animation="glow">
                                            <Placeholder xs={6} />
                                        </Placeholder>
                                        <Placeholder as={Card.Text} animation="glow">
                                            <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
                                            <Placeholder xs={6} /> <Placeholder xs={8} />
                                        </Placeholder>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : recentEgressos.length > 0 ? (
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {recentEgressos.map(egresso => (
                            <Col key={egresso.id}>
                                <Card as={Link} to={`/profile/${egresso.id}`} className="text-decoration-none h-100 shadow-sm modern-card lift-on-hover">
                                    <Card.Img
                                        variant="top"
                                        src={egresso.profileImage || "/placeholder.png"}
                                        alt={`Foto de ${egresso.name}`}
                                        style={{ height: "250px", objectFit: "cover" }}
                                    />
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title className="text-primary">{egresso.name}</Card.Title>
                                        <Card.Text className="text-muted small">
                                            {egresso.course || 'Curso não especificado'}
                                            {egresso.graduationYear && ` - ${egresso.graduationYear}`}
                                        </Card.Text>
                                        <Button variant="outline-primary" size="sm" className="mt-auto align-self-start btn-modern">Ver Perfil</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Col>
                        <p className="text-muted text-center lead mt-5">Nenhum egresso verificado recentemente.</p>
                    </Col>
                )}
            </Container>
        </>
    );
};

export default PublicHome;
