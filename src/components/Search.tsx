// src/components/Search.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { api, Egresso } from '../api'; // Assuming Egresso type is available
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Form, Card, Row, Col, Placeholder, Alert as BootstrapAlert, Button, Spinner } from 'react-bootstrap';
import { useAppContext } from '../AppContext';
import AutocompleteInput from './AutocompleteInput';

const Search: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { allCourses, allEgressosForAutocomplete, loading: contextLoading } = useAppContext();

    const [verifiedEgressos, setVerifiedEgressos] = useState<Egresso[]>([]);
    const [filteredResults, setFilteredResults] = useState<Egresso[]>([]);

    const [searchTermName, setSearchTermName] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [searchGraduationYear, setSearchGraduationYear] = useState('');

    const [loadingPageData, setLoadingPageData] = useState(true); 
    const [isFiltering, setIsFiltering] = useState(false); 
    const [initialParamsApplied, setInitialParamsApplied] = useState(false);


    // Effect to set initial verified egressos and parse URL params
    useEffect(() => {
        if (!contextLoading) { 
            setLoadingPageData(true);
            const verified = allEgressosForAutocomplete.filter(e => e.verified);
            setVerifiedEgressos(verified);

            const params = new URLSearchParams(location.search);
            const qName = params.get('q') || '';
            const qCourse = params.get('course') || '';
            const qYear = params.get('year') || '';

            setSearchTermName(qName);
            setSelectedCourse(qCourse);
            setSearchGraduationYear(qYear);

            // Perform initial search based on URL params
            // This ensures performFullSearch is called once after verifiedEgressos is set and initial params are parsed.
            // No need to call it again here as the dependency array of the next useEffect will handle it.
            setInitialParamsApplied(true);
            setLoadingPageData(false);
        }
    }, [contextLoading, allEgressosForAutocomplete, location.search]); // location.search will trigger re-parse

    // Effect for performing search/filtering when filter criteria change or initial data is ready
    const performFullSearch = useCallback(() => {
        if (!initialParamsApplied || verifiedEgressos.length === 0 && !contextLoading) { // Don't run if initial data isn't ready
            if (!contextLoading && verifiedEgressos.length > 0) { // if verifiedEgressos are loaded, but params weren't applied yet (direct navigation)
                setFilteredResults(verifiedEgressos); // show all verified
            }
            return;
        }
        setIsFiltering(true);

        let results = [...verifiedEgressos];

        if (searchTermName) {
            results = results.filter(e => e.name.toLowerCase().includes(searchTermName.toLowerCase()));
        }
        if (selectedCourse) {
            results = results.filter(e => e.course === selectedCourse);
        }
        if (searchGraduationYear) {
            results = results.filter(e => e.graduationYear?.includes(searchGraduationYear));
        }
        setFilteredResults(results);

        // Debounce setting filtering to false to avoid quick flashes
        const timer = setTimeout(() => setIsFiltering(false), 300);
        return () => clearTimeout(timer);

    }, [searchTermName, selectedCourse, searchGraduationYear, verifiedEgressos, initialParamsApplied, contextLoading]);

    useEffect(() => {
        if (initialParamsApplied) { // Only run filtering after initial params are set and data is available
            performFullSearch();
        }
    }, [performFullSearch, initialParamsApplied]); 


    const handleFormSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        performFullSearch(); // Use current state values set by inputs/autocomplete

        const params = new URLSearchParams();
        if (searchTermName) params.set('q', searchTermName);
        if (selectedCourse) params.set('course', selectedCourse);
        if (searchGraduationYear) params.set('year', searchGraduationYear);
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };

    const handleNameAutocompleteNav = (egressoId: string) => {
        navigate(`/profile/${egressoId}`);
    };

    const handleNameAutocompleteTermSubmit = (term: string) => {
        setSearchTermName(term); // Update state
        // Form submit will handle the actual filtering with this new term
        // Or trigger it directly:
        // performFullSearch(term, selectedCourse, searchGraduationYear, verifiedEgressos);
        // updateUrl(term, selectedCourse, searchGraduationYear);
    };


    const renderEgressoCard = (egresso: Egresso) => (
        <Col key={egresso.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
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
        <Col key={idx} xs={12} sm={6} md={4} lg={3} className="mb-4">
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

    if (loadingPageData || contextLoading && !initialParamsApplied) {
        return (<Container className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="lead mt-3">Carregando filtros e dados...</p>
        </Container>
        );
    }

    return (
        <Container className="p-md-4 search-page-container">
            <h1 className="mb-4 page-title">Buscar Egressos</h1>

            <Form onSubmit={handleFormSubmit} className="mb-4">
                <Row className="g-3 align-items-end">
                    <Col md={5} className="autocomplete-search-col">
                        <Form.Label htmlFor="searchTermNameInput" className="fw-medium">Nome do Egresso</Form.Label>
                        <AutocompleteInput
                            suggestionsData={verifiedEgressos}
                            onSuggestionClickNavigate={handleNameAutocompleteNav}
                            onTermSubmit={handleNameAutocompleteTermSubmit} // If enter is pressed in autocomplete
                            initialValue={searchTermName} // Sync value from URL params
                            onInputChange={setSearchTermName} // Keep parent state in sync
                            placeholder="Digite um nome..."
                            inputClassName="form-control-modern"
                            showSubmitButton={false} // Main form has a submit button
                            isLoadingData={contextLoading && verifiedEgressos.length === 0}
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Label htmlFor="searchCourseSelect" className="fw-medium">Curso</Form.Label>
                        <Form.Select
                            id="searchCourseSelect"
                            className="form-select-modern"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)} // Live filtering via useEffect
                        >
                            <option value="">Todos os Cursos</option>
                            {allCourses.map(course => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={2}>
                        <Form.Label htmlFor="searchYearInput" className="fw-medium">Ano de Formatura</Form.Label>
                        <Form.Control id="searchYearInput" type="text" placeholder="Ano..." className="form-control-modern"
                            value={searchGraduationYear} onChange={(e) => setSearchGraduationYear(e.target.value)} // Live filtering via useEffect
                        />
                    </Col>
                    <Col md={2} className="d-grid">
                        <Button variant="primary" type="submit" className="btn-modern w-100" disabled={isFiltering}>
                            {isFiltering ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Buscar'}
                        </Button>
                    </Col>
                </Row>
            </Form>

            {isFiltering && filteredResults.length === 0 ? ( // Show loading only if no results yet while filtering
                <Row>{Array.from({ length: 8 }).map((_, idx) => renderPlaceholderCard(idx))}</Row>
            ) : !isFiltering && filteredResults.length === 0 && (searchTermName || selectedCourse || searchGraduationYear) ? (
                <BootstrapAlert variant="info" className="modern-alert text-center lead mt-4">
                    Nenhum egresso encontrado com os filtros aplicados.
                </BootstrapAlert>
            ) : !isFiltering && verifiedEgressos.length === 0 && !contextLoading ? (
                <BootstrapAlert variant="info" className="modern-alert text-center lead mt-4">
                    Nenhum egresso verificado cadastrado no sistema ainda.
                </BootstrapAlert>
            ) : (
                <Row>
                    {filteredResults.map(egresso => renderEgressoCard(egresso))}
                </Row>
            )}
        </Container>
    );
};

export default Search;