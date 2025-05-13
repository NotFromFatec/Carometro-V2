// src/components/PublicHome.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Placeholder, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { api, Egresso } from '../api';
import AutocompleteInput from './AutocompleteInput';
import { useAppContext } from '../AppContext';

const PublicHome: React.FC = () => {
    const [recentEgressos, setRecentEgressos] = useState<Egresso[]>([]);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const navigate = useNavigate();
    const { allEgressosForAutocomplete, loading: contextLoading } = useAppContext();

    useEffect(() => {
        setLoadingRecent(true);
        if (!contextLoading && allEgressosForAutocomplete.length > 0) {
            const verified = allEgressosForAutocomplete.filter(e => e.verified);
            verified.sort((a, b) => ((b.id || "") > (a.id || "")) ? 1 : -1); // Ensure id is treated as string or handle null
            setRecentEgressos(verified.slice(0, 6));
            setLoadingRecent(false);
        } else if (!contextLoading && allEgressosForAutocomplete.length === 0) {
            api.getEgressos().then(all => {
                const verified = all.filter(e => e.verified);
                verified.sort((a, b) => ((b.id || "") > (a.id || "")) ? 1 : -1);
                setRecentEgressos(verified.slice(0, 6));
            }).finally(() => setLoadingRecent(false));
        }
    }, [allEgressosForAutocomplete, contextLoading]);

    const handleAutocompleteNavToProfile = (egressoId: string) => {
        navigate(`/profile/${egressoId}`);
    };

    const handleAutocompleteTermSubmit = (term: string) => {
        if (term.trim()) {
            navigate(`/search?q=${encodeURIComponent(term.trim())}`);
        } else {
            navigate('/search');
        }
    };

    const renderEgressoCard = (egresso: Egresso) => (
        <Col key={egresso.id} xs={12} sm={6} lg={4} className="mb-4">
            <Card as={Link} to={`/profile/${egresso.id}`} className="text-decoration-none modern-card egresso-card lift-on-hover">
                <Card.Img variant="top" src={egresso.profileImage || "/placeholder.png"} alt={`Foto de ${egresso.name}`} className="card-img-top" />
                <Card.Body>
                    <Card.Title>{egresso.name}</Card.Title>
                    <span className="card-subtitle-custom">
                        {egresso.course || 'Curso não especificado'}
                        {egresso.graduationYear && ` - ${egresso.graduationYear}`}
                    </span>
                    <Button variant="outline-primary" size="sm" className="btn-modern btn-view-profile">Ver Perfil</Button>
                </Card.Body>
            </Card>
        </Col>
    );

    const renderPlaceholderCard = (idx: number) => (
        <Col key={idx} xs={12} sm={6} lg={4} className="mb-4">
            <Card className="modern-card egresso-card">
                <Placeholder animation="glow"><Placeholder className="card-img-top" style={{ height: '200px' }} /></Placeholder>
                <Card.Body>
                    <Placeholder as={Card.Title} animation="glow"><Placeholder xs={8} /></Placeholder>
                    <Placeholder as="span" animation="glow" className="card-subtitle-custom"><Placeholder xs={10} /><Placeholder xs={7} /></Placeholder>
                    <Placeholder.Button variant="outline-primary" xs={5} size="sm" className="btn-modern btn-view-profile" />
                </Card.Body>
            </Card>
        </Col>
    );

    return (
        <>
            <Container className="p-md-4 public-home-container">
                <div className="text-center my-4 my-md-5">
                    <h1 className="display-5 fw-bold page-title">Bem-vindo ao Carômetro</h1>
                    <p className="lead text-muted">Encontre e conecte-se com egressos da nossa instituição.</p>
                </div>

                <Row className="justify-content-center mb-5">
                    <Col xs={12} md={9} lg={7}>
                        <AutocompleteInput
                            suggestionsData={allEgressosForAutocomplete.filter(e => e.verified)}
                            onSuggestionClickNavigate={handleAutocompleteNavToProfile}
                            onTermSubmit={handleAutocompleteTermSubmit}
                            placeholder="Buscar egressos por nome ou curso..."
                            inputClassName="form-control-lg shadow-sm"
                            showSubmitButton={true}
                            submitButtonText="Buscar"
                            isLoadingData={contextLoading && allEgressosForAutocomplete.length === 0}
                        />
                    </Col>
                </Row>

                <h2 className="mb-4 section-title">Egressos em Destaque</h2>
                {loadingRecent || (contextLoading && allEgressosForAutocomplete.length === 0) ? (
                    <Row>{Array.from({ length: 3 }).map((_, idx) => renderPlaceholderCard(idx))}</Row>
                ) : recentEgressos.length > 0 ? (
                    <Row>{recentEgressos.map(egresso => renderEgressoCard(egresso))}</Row>
                ) : (
                    <Col><p className="text-muted text-center lead mt-3 mb-5">Nenhum egresso em destaque no momento.</p></Col>
                )}
            </Container>

            {/* About Us Section */}
            <section className="about-us-section py-5">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8} className="text-center">
                            <h2 className="mb-4 section-title" style={{ display: 'inline-block' }}>Sobre o Carômetro</h2>
                            <p className="lead mb-4">
                                O Carômetro é uma plataforma dedicada a conectar os egressos da nossa querida instituição,
                                facilitando a manutenção de laços profissionais e pessoais formados durante os anos de estudo.
                            </p>
                            <p className="mb-3">
                                Nossa missão é fornecer um espaço onde ex-alunos possam compartilhar suas trajetórias, conquistas
                                e encontrar oportunidades, fortalecendo a comunidade de egressos e promovendo networking valioso.
                            </p>
                            <p>
                                Este projeto foi desenvolvido com o intuito de ser uma ferramenta útil e um ponto de reencontro,
                                valorizando cada membro da nossa história.
                            </p>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    );
};

export default PublicHome;