import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getTeacherByUserId } from '../services/teacherService';
import { Container, Card, ListGroup, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const TeacherModulesPage = () => {
    const [modules, setModules] = useState([]);
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !user.userId) {
                setLoading(false);
                setError('User not authenticated or user ID not available.');
                return;
            }

            try {
                const teacherData = await getTeacherByUserId(user.userId);
                setTeacher(teacherData);

                if (!teacherData || !teacherData.enseignantId) {
                    setLoading(false);
                    setError('Teacher data not found or enseignantId missing.');
                    return;
                }

                const enseignantId = parseInt(teacherData.enseignantId, 10);

                if (isNaN(enseignantId)) {
                    setLoading(false);
                    setError('Invalid enseignantId obtained.');
                    return;
                }

                const accessToken = localStorage.getItem('accessToken');
                const modulesResponse = await axios.get(`http://localhost:8080/api/modules/enseignant/${enseignantId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setModules(modulesResponse.data);

            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleViewNotesClick = (module) => {
        navigate(`/teacher/modules/${module.idModule}/notes?filiereId=${module.filiere}&semester=${module.semester}&hasTp=${module.hasTp}`);
    };

    if (loading) {
        return <Container className="mt-5"><div className="text-center">Loading data...</div></Container>;
    }

    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    if (!teacher) {
        return <Container className="mt-5"><div className="text-center">No teacher data found.</div></Container>;
    }

    if (modules.length === 0) {
        return <Container className="mt-5"><div className="text-center">No modules found for {teacher.prenom} {teacher.nom}.</div></Container>;
    }

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Modules for {teacher.prenom} {teacher.nom}</h1>
            <ListGroup>
                {modules.map(module => (
                    <ListGroup.Item key={module.idModule} className="mb-3 p-3 d-flex justify-content-between align-items-center">
                        <Card border="info" className="flex-grow-1 me-3">
                            <Card.Body>
                                <Card.Title className="text-primary">{module.nomModule}</Card.Title>
                                <Card.Text>
                                    <strong>Code:</strong> {module.codeModule}<br/>
                                    <strong>Volume Horaire:</strong> {module.volumeHoraire}<br/>
                                    <strong>Semester:</strong> {module.semester}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                        <Button
                            variant="primary"
                            onClick={() => handleViewNotesClick(module)}
                        >
                            View Notes
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
};

export default TeacherModulesPage; 