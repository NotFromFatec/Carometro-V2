// src/components/admin/AdminCoursesView.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useAppContext } from '../../AppContext';

interface AdminCoursesViewProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}

const AdminCoursesView: React.FC<AdminCoursesViewProps> = ({ showAlert }) => {
    const { allCourses, setAllCourses } = useAppContext();
    const [loadingCoursesState, setLoadingCoursesState] = useState(true);

    const [showCourseModal, setShowCourseModal] = useState(false);
    const [courseAction, setCourseAction] = useState<'add' | 'edit'>('add');
    const [currentCourse, setCurrentCourse] = useState('');
    const [courseInput, setCourseInput] = useState('');

    useEffect(() => {
        if (allCourses.length > 0) {
            setLoadingCoursesState(false);
        } else {
            api.getCourses()
                .then(fetchedCourses => {
                    setAllCourses(fetchedCourses);
                })
                .catch(err => {
                    console.error("Error fetching courses in AdminCoursesView:", err);
                    showAlert('Falha ao carregar cursos.', 'danger');
                })
                .finally(() => setLoadingCoursesState(false));
        }
    }, [allCourses, setAllCourses, showAlert]);

    const handleSaveCoursesToApi = async (updatedCourses: string[]) => {
        try {
            await api.saveCourses(updatedCourses);
            setAllCourses(updatedCourses);
            showAlert('Lista de cursos salva com sucesso!', 'success');
            return true;
        } catch (error) {
            showAlert('Falha ao salvar cursos.', 'danger');
            return false;
        }
    };

    const handleCourseFormSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (courseAction === 'add') {
            await handleAddCourse();
        } else {
            await handleEditCourse();
        }
    };

    const handleAddCourse = async () => {
        const trimmedInput = courseInput.trim();
        if (trimmedInput && !allCourses.includes(trimmedInput)) {
            const updatedCourses = [...allCourses, trimmedInput];
            if (await handleSaveCoursesToApi(updatedCourses)) {
                setCourseInput('');
                setShowCourseModal(false);
            }
        } else if (allCourses.includes(trimmedInput)) {
            showAlert('Este curso já existe.', 'warning');
        } else {
            showAlert('Nome do curso inválido.', 'warning');
        }
    };

    const handleEditCourse = async () => {
        const trimmedInput = courseInput.trim();
        if (trimmedInput && currentCourse) {
            if (allCourses.includes(trimmedInput) && trimmedInput !== currentCourse) {
                showAlert('Já existe um curso com este nome.', 'warning');
                return;
            }
            const updatedCourses = allCourses.map(course =>
                course === currentCourse ? trimmedInput : course
            );
            if (await handleSaveCoursesToApi(updatedCourses)) {
                setCourseInput('');
                setCurrentCourse('');
                setShowCourseModal(false);
            }
        } else {
            showAlert('Nome do curso inválido.', 'warning');
        }
    };

    const handleDeleteCourse = async (courseToDelete: string) => {
        if (window.confirm(`Tem certeza que deseja deletar o curso "${courseToDelete}"? Esta ação não pode ser desfeita.`)) {
            const updatedCourses = allCourses.filter(course => course !== courseToDelete);
            await handleSaveCoursesToApi(updatedCourses);
        }
    };

    const openAddModal = () => {
        setCourseAction('add');
        setCourseInput('');
        setCurrentCourse('');
        setShowCourseModal(true);
    };

    const openEditModal = (course: string) => {
        setCourseAction('edit');
        setCourseInput(course);
        setCurrentCourse(course);
        setShowCourseModal(true);
    };

    if (loadingCoursesState && allCourses.length === 0) {
        return <Container className="text-center p-5"><div className="spinner-border text-primary" role="status"></div><p className="mt-2">Carregando cursos...</p></Container>;
    }

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0 section-title" style={{ borderBottom: 'none', fontSize: '1.5rem' }}>Gerenciar Cursos</h3>
                <Button variant="primary" className="btn-modern btn-sm" onClick={openAddModal}>
                    Adicionar Novo Curso
                </Button>
            </div>
            {allCourses.length === 0 && !loadingCoursesState ? (
                <Alert variant="info" className="modern-alert text-center">Nenhum curso cadastrado ainda. Clique em "Adicionar Novo Curso" para começar.</Alert>
            ) : (
                <div className="modern-card" style={{ border: 'none', boxShadow: 'none' }}>
                    <Table hover className="modern-table mb-0">
                        <thead>
                            <tr><th>Nome do Curso</th><th className="text-end">Ações</th></tr>
                        </thead>
                        <tbody>
                            {allCourses.map(course => (
                                <tr key={course}>
                                    <td>{course}</td>
                                    <td className="text-end">
                                        <Button variant="outline-primary" size="sm" className="me-2 btn-modern" onClick={() => openEditModal(course)}>Editar</Button>
                                        <Button variant="outline-danger" size="sm" className="btn-modern" onClick={() => handleDeleteCourse(course)}>Deletar</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            <Modal show={showCourseModal} onHide={() => setShowCourseModal(false)} centered>
                <Form onSubmit={handleCourseFormSubmit}> 
                    <Modal.Header closeButton>
                        <Modal.Title className="modal-title-styled">{courseAction === 'add' ? 'Adicionar Novo Curso' : 'Editar Curso'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label htmlFor="course-input" className="fw-medium">Nome do Curso</Form.Label>
                            <Form.Control
                                id="course-input" type="text" className="form-control-modern"
                                placeholder={courseAction === 'add' ? "Ex: Engenharia de Computação" : "Editar nome do curso"}
                                value={courseInput} onChange={(e) => setCourseInput(e.target.value)}
                                autoFocus required 
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" className="btn-modern" onClick={() => setShowCourseModal(false)}>Cancelar</Button>
                        <Button variant="primary" className="btn-modern" type="submit"> 
                            {courseAction === 'add' ? 'Adicionar' : 'Salvar'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AdminCoursesView;