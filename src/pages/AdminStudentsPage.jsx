import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const AdminStudentsPage = () => {
    const [filieres, setFilieres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        nom: '',
        prenom: '',
        filiereId: '',
        semester: ''
    });
    const [addSuccess, setAddSuccess] = useState(null);
    const [addingStudent, setAddingStudent] = useState(false);

    useEffect(() => {
        fetchFilieres();
    }, []);

    const fetchFilieres = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axios.get('http://localhost:8080/api/filieres/active', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setFilieres(response.data);
        } catch (err) {
            console.error('Error fetching filieres:', err);
            setError('Failed to load filieres data.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAddingStudent(true);
        setError(null);
        setAddSuccess(null);
        try {
            const accessToken = localStorage.getItem('accessToken');
            await axios.post(
                'http://localhost:8080/api/admin/student',
                null,
                {
                    params: formData,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            setAddSuccess('Student added successfully!');
            setShowAddModal(false);
            setFormData({
                email: '',
                nom: '',
                prenom: '',
                filiereId: '',
                semester: ''
            });
        } catch (err) {
            console.error('Error adding student:', err);
            setError('Failed to add student. Please try again.');
        } finally {
            setAddingStudent(false);
        }
    };

    if (loading) {
        return (
            <Container className="mt-5">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Card className="shadow">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Gestion des Étudiants (Ajout)</h3>
                    <Button variant="light" onClick={() => setShowAddModal(true)}>
                        Ajouter un Étudiant
                    </Button>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {addSuccess && <Alert variant="success">{addSuccess}</Alert>}
                    
                    <p>Click the "Ajouter un Étudiant" button to add a new student.</p>
                </Card.Body>
            </Card>

            {/* Add Student Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Ajouter un Étudiant</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                                type="text"
                                name="nom"
                                value={formData.nom}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Prénom</Form.Label>
                            <Form.Control
                                type="text"
                                name="prenom"
                                value={formData.prenom}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Filière</Form.Label>
                            <Form.Select
                                name="filiereId"
                                value={formData.filiereId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Sélectionner une filière</option>
                                {filieres.map((filiere) => (
                                    <option key={filiere.filiereId} value={filiere.filiereId}>
                                        {filiere.nom}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Semestre</Form.Label>
                            <Form.Select
                                name="semester"
                                value={formData.semester}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Sélectionner un semestre</option>
                                <option value="S1">Semestre 1</option>
                                <option value="S2">Semestre 2</option>
                                <option value="S3">Semestre 3</option>
                                <option value="S4">Semestre 4</option>
                                <option value="S5">Semestre 5</option>
                                <option value="S6">Semestre 6</option>
                            </Form.Select>
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button variant="primary" type="submit" disabled={addingStudent}>
                                {addingStudent ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />Adding...</> : 'Ajouter'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default AdminStudentsPage; 