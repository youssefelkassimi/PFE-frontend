import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Alert, Spinner, Form, Pagination } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getTeacherByUserId } from '../services/teacherService';
import axios from 'axios';

const ChefFiliereStudentsPage = () => {
    const [filieres, setFilieres] = useState([]);
    const [selectedFiliereId, setSelectedFiliereId] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10);
    const { user } = useAuth();

    // Fetch filieres when component mounts
    useEffect(() => {
        const fetchFilieres = async () => {
            try {
                if (!user || !user.userId) {
                    setError('User not authenticated or user ID not available.');
                    setLoading(false);
                    return;
                }

                const teacherData = await getTeacherByUserId(user.userId);
                
                if (!teacherData || !teacherData.enseignantId) {
                    setError('Teacher data not found or enseignantId missing.');
                    setLoading(false);
                    return;
                }

                const accessToken = localStorage.getItem('accessToken');
                const response = await axios.get(
                    `http://localhost:8080/api/filieres/${teacherData.enseignantId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }
                );

                setFilieres(response.data);
                if (response.data.length > 0) {
                    setSelectedFiliereId(response.data[0].filiereId);
                }
            } catch (err) {
                console.error('Error fetching filieres:', err);
                setError('Failed to load filieres data.');
            } finally {
                setLoading(false);
            }
        };

        fetchFilieres();
    }, [user]);

    // Fetch students when selected filiere changes
    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedFiliereId) return;

            setLoadingStudents(true);
            try {
                const accessToken = localStorage.getItem('accessToken');
                const response = await axios.get(
                    `http://localhost:8080/api/students/filiere/${selectedFiliereId}?pageNumber=${currentPage}&pageSize=${pageSize}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }
                );

                setStudents(response.data.etudiant);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                console.error('Error fetching students:', err);
                setError('Failed to load students data.');
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [selectedFiliereId, currentPage, pageSize]);

    const handleFiliereChange = (e) => {
        setSelectedFiliereId(e.target.value);
        setCurrentPage(0); // Reset to first page when changing filiere
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber - 1); // Convert to 0-based index
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

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Card className="shadow">
                <Card.Header className="bg-primary text-white">
                    <h3 className="mb-0">Gestion des Étudiants</h3>
                </Card.Header>
                <Card.Body>
                    <Form.Group className="mb-4">
                        <Form.Label>Sélectionner une Filière</Form.Label>
                        <Form.Select 
                            value={selectedFiliereId} 
                            onChange={handleFiliereChange}
                            disabled={loadingStudents}
                        >
                            <option value="">Choisir une filière...</option>
                            {filieres.map((filiere) => (
                                <option key={filiere.filiereId} value={filiere.filiereId}>
                                    {filiere.nom}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {loadingStudents ? (
                        <div className="text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : students.length === 0 ? (
                        <Alert variant="info">Aucun étudiant trouvé dans cette filière.</Alert>
                    ) : (
                        <>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Code APJ</th>
                                        <th>Nom</th>
                                        <th>Prénom</th>
                                        <th>CNE</th>
                                        <th>Téléphone</th>
                                        <th>Statut</th>
                                        <th>Semestre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student.codeApj}>
                                            <td>{student.codeApj}</td>
                                            <td>{student.nom}</td>
                                            <td>{student.prenom}</td>
                                            <td>{student.cne}</td>
                                            <td>{student.telephone}</td>
                                            <td>
                                                <span className={`badge ${
                                                    student.statut === 'ACTIF' ? 'bg-success' : 
                                                    student.statut === 'INACTIF' ? 'bg-danger' : 'bg-warning'
                                                }`}>
                                                    {student.statut}
                                                </span>
                                            </td>
                                            <td>{student.semester}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <div className="d-flex justify-content-center mt-4">
                                <Pagination>
                                    <Pagination.First 
                                        onClick={() => handlePageChange(1)} 
                                        disabled={currentPage === 0}
                                    />
                                    <Pagination.Prev 
                                        onClick={() => handlePageChange(currentPage)} 
                                        disabled={currentPage === 0}
                                    />
                                    
                                    {[...Array(totalPages)].map((_, index) => (
                                        <Pagination.Item
                                            key={index + 1}
                                            active={index === currentPage}
                                            onClick={() => handlePageChange(index + 1)}
                                        >
                                            {index + 1}
                                        </Pagination.Item>
                                    ))}

                                    <Pagination.Next 
                                        onClick={() => handlePageChange(currentPage + 2)} 
                                        disabled={currentPage === totalPages - 1}
                                    />
                                    <Pagination.Last 
                                        onClick={() => handlePageChange(totalPages)} 
                                        disabled={currentPage === totalPages - 1}
                                    />
                                </Pagination>
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ChefFiliereStudentsPage; 