// src/components/EditProfile.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, EgressoData } from '../api'; 
import { Container, Form, Row, Col, Button, Image, Card, Spinner } from 'react-bootstrap';
import { useAppContext } from '../AppContext';

interface EditProfileProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ showAlert }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Partial<EgressoData>>({});
    const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);
    const [error, setError] = useState('');
    const { egressoUser, allCourses, setAllCourses, loading: contextLoading } = useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingPageData, setLoadingPageData] = useState(true);


    useEffect(() => {
        if (!contextLoading && !egressoUser?.id) {
            navigate('/login');
            return;
        }
        if (egressoUser?.id) {
            const fetchProfileAndCourses = async () => {
                setLoadingPageData(true);
                try {
                    const egresso = await api.getEgresso(egressoUser.id!);
                    if (egresso) {
                        setFormData(egresso.toJson());
                        setProfileImageBase64(egresso.profileImage || null);
                    } else {
                        setError('Falha ao carregar o perfil para edição.');
                        showAlert('Falha ao carregar o perfil para edição.', 'danger');
                    }

                    // Courses might already be in context, but fetch if not (direct navigation)
                    if (allCourses.length === 0) {
                        const fetchedCourses = await api.getCourses();
                        if (fetchedCourses) {
                            setAllCourses(fetchedCourses); 
                        } else {
                            showAlert('Falha ao carregar os cursos disponíveis.', 'danger');
                        }
                    }
                } catch (err) {
                    console.error("Error fetching profile/courses:", err);
                    setError('Erro ao carregar dados para edição.');
                    showAlert('Erro ao carregar dados.', 'danger');
                }
                finally {
                    setLoadingPageData(false);
                }
            };
            fetchProfileAndCourses();
        }
    }, [navigate, egressoUser?.id, contextLoading, allCourses.length, setAllCourses, showAlert]); 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContactLinkChange = (index: number, value: string) => {
        const currentLinks = formData.contactLinks || [];
        const newLinks = [...currentLinks];
        newLinks[index] = value;
        setFormData({ ...formData, contactLinks: newLinks });
    };

    const addContactLink = () => {
        const currentLinks = formData.contactLinks || [];
        if (currentLinks.length < 5) { // Limit number of links
            setFormData({ ...formData, contactLinks: [...currentLinks, ''] });
        } else {
            showAlert("Você pode adicionar no máximo 5 links de contato.", "warning");
        }
    };

    const removeContactLink = (index: number) => {
        const currentLinks = formData.contactLinks || [];
        const newLinks = currentLinks.filter((_, i) => i !== index);
        setFormData({ ...formData, contactLinks: newLinks });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 3 * 1024 * 1024) { // 3MB limit
                showAlert('A imagem é muito grande. O tamanho máximo permitido é 3MB.', 'danger');
                e.target.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setProfileImageBase64(base64String);
                // Assuming faceImage is same as profileImage, because faceImage isnt implemented yet
                setFormData({ ...formData, profileImage: base64String, faceImage: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!egressoUser?.id) return;

        setIsSubmitting(true);
        try {
            const updatedData = { ...formData };
            // Ensure empty strings for optional fields if they are not filled, instead of undefined
            updatedData.course = formData.course || "";
            updatedData.graduationYear = formData.graduationYear || "";

            const updatedEgresso = await api.updateEgresso(egressoUser.id, updatedData);
            if (updatedEgresso) {
                showAlert('Perfil atualizado com sucesso!', 'success');
                navigate(`/profile/${egressoUser.id}`);
            } else {
                setError('Falha ao atualizar o perfil.');
                showAlert('Falha ao atualizar o perfil.', 'danger');
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            setError('Erro ao atualizar o perfil. Tente novamente.');
            showAlert('Erro ao atualizar o perfil', 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingPageData || contextLoading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="lead mt-3">Carregando dados do perfil...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h1 className="page-title mb-4">Editar Perfil</h1>
            {error && <p className="text-danger mb-3 text-center">{error}</p>}

            <Card className="modern-card shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md={3} className="text-center text-md-start mb-3 mb-md-0">
                                <Image
                                    src={profileImageBase64 || "/placeholder.png"}
                                    roundedCircle
                                    className="mb-2"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover', border: '3px solid var(--card-border-color)' }}
                                />
                                <Form.Group controlId="formBasicProfileImage">
                                    <Form.Label className="visually-hidden">Imagem de Perfil</Form.Label>
                                    <Form.Control type="file" accept="image/*" onChange={handleImageChange} className="form-control-modern form-control-sm" />
                                    <Form.Text muted>Max 2MB. JPG, PNG.</Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={9}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formBasicName">
                                            <Form.Label className="fw-medium">Nome Completo</Form.Label>
                                            <Form.Control type="text" name="name" placeholder="Seu nome completo"
                                                value={formData.name || ''} onChange={handleChange} className="form-control-modern" required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formBasicCourse">
                                            <Form.Label className="fw-medium">Curso</Form.Label>
                                            <Form.Select name="course" value={formData.course || ''} onChange={handleChange} className="form-select-modern">
                                                <option value="">Selecione um curso...</option>
                                                {allCourses.map((courseOption) => ( 
                                                    <option key={courseOption} value={courseOption}>{courseOption}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formBasicGraduationYear">
                                            <Form.Label className="fw-medium">Ano de Formatura</Form.Label>
                                            <Form.Control type="text" name="graduationYear" placeholder="Ex: 2023"
                                                value={formData.graduationYear || ''} onChange={handleChange} className="form-control-modern" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3" controlId="formBasicCareerDescription">
                            <Form.Label className="fw-medium">Trajetória Profissional</Form.Label>
                            <Form.Control as="textarea" rows={4} name="careerDescription" placeholder="Descreva sua experiência profissional, áreas de interesse, etc."
                                value={formData.careerDescription || ''} onChange={handleChange} className="form-control-modern" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicDescription">
                            <Form.Label className="fw-medium">Descrição Pessoal</Form.Label>
                            <Form.Control as="textarea" rows={3} name="personalDescription" placeholder="Fale um pouco sobre você, seus hobbies, etc."
                                value={formData.personalDescription || ''} onChange={handleChange} className="form-control-modern" />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formBasicContactLinks">
                            <Form.Label className="fw-medium mb-2">Links de Contato (LinkedIn, GitHub, Portfólio, etc.)</Form.Label>
                            {formData.contactLinks?.map((link, index) => (
                                <Row className="mb-2 gx-2 align-items-center" key={index}>
                                    <Col>
                                        <Form.Control type="url" placeholder="https://exemplo.com" value={link}
                                            onChange={(e) => handleContactLinkChange(index, e.target.value)} className="form-control-modern" />
                                    </Col>
                                    <Col xs="auto">
                                        <Button variant="outline-danger" onClick={() => removeContactLink(index)} size="sm" className="btn-modern">Remover</Button>
                                    </Col>
                                </Row>
                            ))}
                            {(!formData.contactLinks || formData.contactLinks.length < 5) &&
                                <Button variant="outline-secondary" onClick={addContactLink} size="sm" className="btn-modern mt-1">
                                    Adicionar Link
                                </Button>
                            }
                        </Form.Group>
                        <hr />
                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button variant="outline-secondary" className="btn-modern" onClick={() => navigate(egressoUser ? `/profile/${egressoUser.id}` : '/home')}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" className="btn-modern" disabled={isSubmitting}>
                                {isSubmitting ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" /> Salvando...</> : 'Salvar Alterações'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EditProfile;