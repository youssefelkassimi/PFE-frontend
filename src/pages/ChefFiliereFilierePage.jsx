import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getTeacherByUserId } from '../services/teacherService';
import axios from 'axios';

const ChefFiliereFilierePage = () => {
    const [filieres, setFilieres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchFilieres = async () => {
            try {
                if (!user || !user.userId) {
                    setError('User not authenticated or user ID not available.');
                    setLoading(false);
                    return;
                }

                // First get the teacher data to get enseignantId
                const teacherData = await getTeacherByUserId(user.userId);
                
                if (!teacherData || !teacherData.enseignantId) {
                    setError('Teacher data not found or enseignantId missing.');
                    setLoading(false);
                    return;
                }

                // Then fetch filieres using the enseignantId
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
            } catch (err) {
                console.error('Error fetching filieres:', err);
                setError('Failed to load filieres data.');
            } finally {
                setLoading(false);
            }
        };

        fetchFilieres();
    }, [user]);

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
                    <h3 className="mb-0">Mes Filieres</h3>
                </Card.Header>
                <Card.Body>
                    {filieres.length === 0 ? (
                        <Alert variant="info">No filieres found.</Alert>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Description</th>
                                    <th>Durée d'études</th>
                                    <th>Niveau</th>
                                    <th>Département</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filieres.map((filiere) => (
                                    <tr key={filiere.filiereId}>
                                        <td>{filiere.nom}</td>
                                        <td>{filiere.description}</td>
                                        <td>{filiere.dureeEtudes} ans</td>
                                        <td>{filiere.niveau}</td>
                                        <td>{filiere.departementNam}</td>
                                        <td>
                                            <span className={`badge ${filiere.active ? 'bg-success' : 'bg-danger'}`}>
                                                {filiere.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ChefFiliereFilierePage; 