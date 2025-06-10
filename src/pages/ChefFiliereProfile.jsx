import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { getTeacherByUserId, updateTeacher } from '../services/teacherService';
import { useAuth } from '../context/AuthContext';

const ChefFiliereProfile = () => {
    const [enseignant, setEnseignant] = useState(null);
    const [editableEnseignantData, setEditableEnseignantData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveError, setSaveError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);

    console.log('ChefFiliereProfile: user from useAuth', user);

    useEffect(() => {
        console.log('ChefFiliereProfile useEffect: user', user);
        console.log('ChefFiliereProfile useEffect: user.userId', user?.userId);

        const fetchData = async () => {
            if (!user || !user.userId) {
                setLoading(false);
                setError('User not authenticated or user ID not available.');
                return;
            }

            try {
                setLoading(true);
                const data = await getTeacherByUserId(user.userId);
                console.log('ChefFiliereProfile: fetched enseignant data', data);
                setEnseignant(data);
                setEditableEnseignantData(data);
                if (data.profileUrl) {
                    setImagePreview(data.profileUrl);
                }
            } catch (err) {
                console.error('Error fetching enseignant data:', err);
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableEnseignantData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setEditableEnseignantData(prev => ({
                ...prev,
                profile: file
            }));
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setSaveError(null);

            const formData = new FormData();
            const enseignantDataWithoutFile = { ...editableEnseignantData };
            delete enseignantDataWithoutFile.profile;
            delete enseignantDataWithoutFile.profileUrl;
            delete enseignantDataWithoutFile.dateEmbauche;
            delete enseignantDataWithoutFile.statut;
            delete enseignantDataWithoutFile.grade;
            delete enseignantDataWithoutFile.departementId;
            delete enseignantDataWithoutFile.filiereID;

            Object.keys(enseignantDataWithoutFile).forEach(key => {
                formData.append(key, enseignantDataWithoutFile[key]);
            });

            if (editableEnseignantData.profile) {
                formData.append('profile', editableEnseignantData.profile);
            }

            const updatedEnseignant = await updateTeacher(editableEnseignantData.enseignantId, formData);

            setEnseignant(updatedEnseignant);
            setEditableEnseignantData(updatedEnseignant);
            setImagePreview(updatedEnseignant.profileUrl || null);
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating profile:', err.response?.data || err.message);
            setSaveError(`Failed to update profile: ${err.response?.data || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditableEnseignantData(enseignant);
        setImagePreview(enseignant.profileUrl || null);
        setIsEditing(false);
        setSaveError(null);
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

    if (!enseignant) {
        return (
            <Container className="mt-4">
                <Alert variant="info">
                    No Chef Filiere data found.
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h2>Chef Filiere Profile</h2>
            {saveError && (
                <Alert variant="danger" className="mb-3">
                    {saveError}
                </Alert>
            )}
            <Form>
                <div className="row">
                    <div className="col-md-4 text-center mb-3">
                        <img
                            src={imagePreview || '/default-profile.png'}
                            alt="Profile"
                            className="img-fluid rounded-circle mb-3"
                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                        {isEditing && (
                            <Form.Group controlId="profileImage" className="mb-3">
                                <Form.Label>Change Profile Image</Form.Label>
                                <Form.Control type="file" onChange={handleImageChange} accept="image/*" />
                            </Form.Group>
                        )}
                    </div>
                    <div className="col-md-8">
                        <Form.Group className="mb-3">
                            <Form.Label>Enseignant ID</Form.Label>
                            <Form.Control type="text" value={enseignant.enseignantId} disabled />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="prenom"
                                value={editableEnseignantData.prenom}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="nom"
                                value={editableEnseignantData.nom}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={editableEnseignantData.email}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                type="tel"
                                name="telephone"
                                value={editableEnseignantData.telephone}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type="text"
                                name="adresse"
                                value={editableEnseignantData.adresse}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Statut</Form.Label>
                            <Form.Control
                                type="text"
                                name="statut"
                                value={editableEnseignantData.statut}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Grade</Form.Label>
                            <Form.Control
                                type="text"
                                name="grade"
                                value={editableEnseignantData.grade}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                    </div>
                </div>
                <div className="mt-3">
                    {isEditing ? (
                        <>
                            <Button variant="primary" onClick={handleSave} disabled={saving} className="me-2">
                                {saving ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                            <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button variant="primary" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </Button>
                    )}
                </div>
            </Form>
        </Container>
    );
};

export default ChefFiliereProfile; 