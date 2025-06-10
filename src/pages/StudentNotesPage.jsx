import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const StudentNotesPage = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentCodeApj, setStudentCodeApj] = useState(null);
    const [studentSemester, setStudentSemester] = useState(null);

    useEffect(() => {
        const fetchStudentDataAndNotes = async () => {
            try {
                if (!user || !user.userId) {
                    setError('User not authenticated or user ID not available.');
                    setLoading(false);
                    return;
                }

                const accessToken = localStorage.getItem('accessToken');

                // First, get the student's codeApj using their userId
                const studentResponse = await axios.get(
                    `http://localhost:8080/api/students/${user.userId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }
                );

                const fetchedStudentData = studentResponse.data;
                if (!fetchedStudentData || !fetchedStudentData.codeApj) {
                    setError('Student data not found or codeApj missing.');
                    setLoading(false);
                    return;
                }
                setStudentCodeApj(fetchedStudentData.codeApj);

                // Then, fetch notes using the student's codeApj
                const notesResponse = await axios.get(
                    `http://localhost:8080/api/notes/student/${fetchedStudentData.codeApj}/notes`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }
                );

                setNotes(notesResponse.data);
            } catch (err) {
                console.error('Error fetching student data or notes:', err);
                setError('Failed to load notes data.');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentDataAndNotes();
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

    const moduleNames = Object.keys(notes);
    const noteTypes = ['NORMAL_EXAM', 'NORMAL_TP', 'RAT_EXAM', 'RAT_TP']; // Define possible note types

    return (
        <Container className="mt-5">
            <Card className="shadow">
                <Card.Header className="bg-primary text-white">
                    <h3 className="mb-0">Mes Notes {studentSemester && `(Semestre: ${studentSemester})`}</h3>
                </Card.Header>
                <Card.Body>
                    {moduleNames.length === 0 ? (
                        <Alert variant="info">Aucune note trouvée pour le moment.</Alert>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Module</th>
                                    {noteTypes.map(type => (
                                        <th key={type}>{type.replace('_', ' ')}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {moduleNames.map(moduleName => (
                                    <tr key={moduleName}>
                                        <td>{moduleName}</td>
                                        {noteTypes.map(type => (
                                            <td key={`${moduleName}-${type}`}>
                                                {notes[moduleName]?.[type] !== undefined 
                                                    ? notes[moduleName][type].toFixed(2) 
                                                    : 'N/A'}
                                            </td>
                                        ))}
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

export default StudentNotesPage; 