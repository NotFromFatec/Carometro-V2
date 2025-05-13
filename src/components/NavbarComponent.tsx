// src/components/NavbarComponent.tsx
import React, { useState, useEffect, useRef } from 'react'; 
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link, useNavigate, useLocation, useResolvedPath, useMatch } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import AutocompleteInput from './AutocompleteInput';

interface NavbarComponentProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}

interface CustomBootstrapNavLinkProps {
    to: string;
    children: React.ReactNode;
    className?: string;
    end?: boolean;
    onClick?: () => void;
}

const CustomBootstrapNavLink: React.FC<CustomBootstrapNavLinkProps> = ({ to, children, className, end = false, onClick }) => {
    const resolved = useResolvedPath(to);
    const match = useMatch({ path: resolved.pathname, end: end });
    const handleClick = () => { if (onClick) onClick(); };
    return (<Nav.Link as={Link} to={to} className={className} active={!!match} onClick={handleClick}>{children}</Nav.Link>);
};

const NavbarComponent: React.FC<NavbarComponentProps> = ({ showAlert }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        isLoggedIn, isAdminLoggedIn, logout, egressoUser, adminUser,
        allEgressosForAutocomplete, loading: contextLoading
    } = useAppContext();

    const [navExpanded, setNavExpanded] = useState(false);
    const navRef = useRef<HTMLDivElement>(null); // Ref for the Navbar

    // Close nav on outside click
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (navExpanded && navRef.current && !navRef.current.contains(event.target as Node)) {
                setNavExpanded(false);
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [navExpanded]);


    const handleLogout = () => {
        setNavExpanded(false);
        logout();
        showAlert('Você saiu com segurança.', 'info');
        navigate('/login');
    };

    const handleAutocompleteSelect = (egressoId: string) => {
        setNavExpanded(false);
        navigate(`/profile/${egressoId}`);
    };

    const closeNav = () => setNavExpanded(false);

    const brandLink = isLoggedIn ? "/home" : isAdminLoggedIn ? "/admin" : "/"; 
    const userName = isLoggedIn && egressoUser ? egressoUser.name?.split(' ')[0] : isAdminLoggedIn && adminUser ? adminUser.name?.split(' ')[0] : '';

    const showAutocompleteSearch = !isAdminLoggedIn &&
        !location.pathname.startsWith("/admin/") &&
        !location.pathname.startsWith("/search") &&
        !location.pathname.startsWith("/login") &&
        !location.pathname.startsWith("/create-account") &&
        !location.pathname.startsWith("/sitemap");


    return (
        <Navbar
            ref={navRef}
            expand="lg"
            fixed="top"
            className="main-navbar"
            expanded={navExpanded}
            onToggle={(isExpanded) => setNavExpanded(isExpanded)}
        >
            <Container fluid="lg">
                <Navbar.Brand as={Link} to={brandLink} onClick={closeNav}>
                    Carômetro <span className="brand-icon" role="img" aria-label="Graduation Cap">🎓</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto align-items-center">
                        <CustomBootstrapNavLink to={brandLink} end onClick={closeNav}>{isAdminLoggedIn ? "Dashboard" : "Início"}</CustomBootstrapNavLink>
                        {/* {!isAdminLoggedIn && (<CustomBootstrapNavLink to="/search" onClick={closeNav}>Buscar Egressos</CustomBootstrapNavLink>)} */}
                        <CustomBootstrapNavLink to="/search" onClick={closeNav}>Buscar Egressos</CustomBootstrapNavLink>
                        {isLoggedIn && egressoUser && (<CustomBootstrapNavLink to={`/profile/${egressoUser.id}`} onClick={closeNav}>Meu Perfil</CustomBootstrapNavLink>)}
                        <CustomBootstrapNavLink to="/sitemap" onClick={closeNav}>Mapa do Site</CustomBootstrapNavLink>
                    </Nav>

                    {showAutocompleteSearch && (
                        <div className="ms-lg-auto me-lg-3 my-2 my-lg-0 autocomplete-wrapper-nav">
                            <AutocompleteInput
                                suggestionsData={allEgressosForAutocomplete.filter(e => e.verified)}
                                onSuggestionClickNavigate={handleAutocompleteSelect}
                                onTermSubmit={(term) => {
                                    closeNav();
                                    if (term.trim()) navigate(`/search?q=${encodeURIComponent(term.trim())}`);
                                    else navigate('/search');
                                }}
                                placeholder="Buscar egresso..."
                                inputClassName="form-control-sm"
                                isLoadingData={contextLoading && allEgressosForAutocomplete.length === 0}
                                showSubmitButton={false}
                            />
                        </div>
                    )}

                    <Nav className={`align-items-center ${showAutocompleteSearch ? '' : 'ms-auto'}`}>
                        {isLoggedIn || isAdminLoggedIn ? (
                            <Button variant="outline-secondary" className="btn-modern btn-sm" onClick={handleLogout}>
                                Sair {userName && `(${userName})`}
                            </Button>
                        ) : (
                            <CustomBootstrapNavLink to="/login" className="me-2" onClick={closeNav}>Entrar</CustomBootstrapNavLink>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;