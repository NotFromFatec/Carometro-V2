// src/components/Footer.tsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <Container fluid="lg">
                <Row className="align-items-center">
                    <Col md={5} className="text-center text-md-start mb-2 mb-md-0">
                        <p className="mb-0">© {currentYear} Carômetro. Todos os direitos reservados.</p>
                        <p className="mb-0 small">Desenvolvido como projeto de laboratório de engenharia.</p>
                    </Col>
                    <Col md={7} className="text-center text-md-end">
                        <ul className="list-unstyled d-flex flex-wrap justify-content-center justify-content-md-end align-items-center mb-0 footer-links">
                            <li className="ms-md-3 mb-1 mb-md-0"><Link to="/">Início</Link></li>
                            <li className="ms-3 mb-1 mb-md-0"><Link to="/search">Buscar</Link></li>
                            <li className="ms-3 mb-1 mb-md-0"><Link to="/sitemap">Mapa do Site</Link></li>
                            <li className="ms-3 mb-1 mb-md-0">
                                <a
                                    href="https://github.com/NotFromFatec/Carometro"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Repositório no GitHub"
                                    className="footer-github-link"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-github" viewBox="0 0 16 16">
                                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                                    </svg>
                                </a>
                            </li>
                        </ul>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;