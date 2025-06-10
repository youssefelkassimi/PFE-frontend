import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const StudentProfilePage = () => {
    const [studentData, setStudentData] = useState(null);
    const [editableStudentData, setEditableStudentData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [profileImage, setProfileImage] = useState(null);

    const { user } = useAuth();

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/api/students/${user.userId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    }
                );
                setStudentData(response.data);
                setEditableStudentData(response.data);
                setProfileImage(response.data.profileUrl || null);
            } catch (err) {
                console.error('Error fetching student data:', err);
                setError('Failed to load student data');
            } finally {
                setLoading(false);
            }
        };

        if (user && user.userId) {
            fetchStudentData();
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableStudentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
            setEditableStudentData(prev => ({
                ...prev,
                profile: file
            }));
        }
    };

    const handleCancel = () => {
        setEditableStudentData(studentData);
        setProfileImage(studentData.profileUrl || null);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setSaveError(null);

            const formData = new FormData();
            const studentDataWithoutFile = { ...editableStudentData };
            delete studentDataWithoutFile.profile;
            delete studentDataWithoutFile.profileUrl;
            delete studentDataWithoutFile.dateInscription;
            delete studentDataWithoutFile.anneeUniversitaire;
            delete studentDataWithoutFile.semester;
            delete studentDataWithoutFile.statut;
            delete studentDataWithoutFile.filierId;

            Object.keys(studentDataWithoutFile).forEach(key => {
                formData.append(key, studentDataWithoutFile[key]);
            });

            if (editableStudentData.profile) {
                formData.append('profile', editableStudentData.profile);
            }

            const response = await axios.put(
                `http://localhost:8080/api/students/${editableStudentData.codeApj}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setStudentData(response.data);
            setEditableStudentData(response.data);
            setProfileImage(response.data.profileUrl || null);
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating student data:', err);
            setSaveError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container className="mt-4">
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
            <Container className="mt-4">
                <Alert variant="danger">
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h2>Student Profile</h2>
            {saveError && (
                <Alert variant="danger" className="mb-3">
                    {saveError}
                </Alert>
            )}
            <Form>
                <div className="row">
                    <div className="col-md-4 mb-3">
                        <div className="text-center">
                            <img
                                src={profileImage || '/default-profile.png'}
                                alt="Profile"
                                className="img-fluid rounded-circle mb-2"
                                style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                            />
                            {isEditing && (
                                <Form.Group controlId="formProfileImage">
                                    <Form.Control
                                        type="file"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                </Form.Group>
                            )}
                        </div>
                    </div>
                    <div className="col-md-8">
                        <Form.Group className="mb-3">
                            <Form.Label>Student ID</Form.Label>
                            <Form.Control
                                type="text"
                                name="codeApj"
                                value={editableStudentData.codeApj}
                                disabled
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="prenom"
                                value={editableStudentData.prenom}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="nom"
                                value={editableStudentData.nom}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={editableStudentData.email}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                type="tel"
                                name="telephone"
                                value={editableStudentData.telephone}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type="text"
                                name="adresse"
                                value={editableStudentData.adresse}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                    </div>
                </div>
                <div className="mt-3">
                    {isEditing ? (
                        <>
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                disabled={saving}
                                className="me-2"
                            >
                                {saving ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </Button>
                    )}
                </div>
            </Form>
        </Container>
    );
};

export default StudentProfilePage; 