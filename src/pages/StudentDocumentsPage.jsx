import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getStudentByUserId, downloadSchoolCertificate } from '../services/studentService';

const StudentDocumentsPage = () => {
    const { user } = useAuth();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchStudent = async () => {
            if (!user || !user.userId) {
                setLoading(false);
                setError('User not authenticated or user ID not available.');
                return;
            }
            try {
                const studentData = await getStudentByUserId(user.userId);
                setStudent(studentData);
            } catch (error) {
                setError('Failed to load student information. Please try again.');
                console.error('Error fetching student information:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
    }, [user.userId, user]);

    const handleDownloadCertificate = async () => {
        try {
            setDownloading(true);
            await downloadSchoolCertificate(student.codeApj);
        } catch (error) {
            setError('Failed to download certificate. Please try again.');
            console.error('Error downloading certificate:', error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Container className="mt-4">
            <h2>Student Documents</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : student ? (
                <Card className="mb-4">
                    <Card.Body>
                        <h4>Available Documents</h4>
                        <div className="d-grid gap-2">
                            <Button 
                                variant="primary" 
                                onClick={handleDownloadCertificate}
                                disabled={downloading}
                            >
                                {downloading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Downloading...
                                    </>
                                ) : (
                                    'Download School Certificate'
                                )}
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            ) : (
                <Alert variant="warning">No student information found.</Alert>
            )}
        </Container>
    );
};

export default StudentDocumentsPage; 