import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Alert } from 'react-bootstrap';
import { getTeacherByUserId, updateTeacher } from '../services/teacherService';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';

const TeacherProfile = () => {
    const [teacher, setTeacher] = useState(null);
    const [editableTeacherData, setEditableTeacherData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveError, setSaveError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const { user } = useAuth();

    console.log('TeacherProfile: user from useAuth', user);

    useEffect(() => {
        console.log('TeacherProfile useEffect: user', user);
        console.log('TeacherProfile useEffect: user.userId', user?.userId);

        const fetchTeacherData = async () => {
            try {
                if (user && user.userId) {
                    const data = await getTeacherByUserId(user.userId);
                    console.log('TeacherProfile: fetched teacher data', data);
                    setTeacher(data);
                    setEditableTeacherData(data);
                    if (data.profilUrl) {
                        setImagePreview(data.profilUrl);
                    }
                } else {
                    console.log('TeacherProfile: user or user.userId is not available, skipping fetch.', user);
                    setLoading(false);
                }
            } catch (err) {
                console.error('TeacherProfile: Error fetching teacher data:', err);
                setError('Failed to load teacher data');
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherData();
    }, [user]);

    const handleEditClick = () => {
        setIsEditing(true);
        setSaveError(null);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditableTeacherData(teacher);
        setSelectedImage(null);
        setImagePreview(teacher.profilUrl);
        setSaveError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableTeacherData({ ...editableTeacherData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveClick = async () => {
        if (!editableTeacherData || !editableTeacherData.enseignantId) {
            setSaveError('Error: Teacher data or ID missing.');
            return;
        }

        const formData = new FormData();
        const enseignantJson = JSON.stringify({
            enseignantId: editableTeacherData.enseignantId,
            userId: editableTeacherData.userId,
            nom: editableTeacherData.nom,
            prenom: editableTeacherData.prenom,
            profil: editableTeacherData.profil,
            profilUrl: editableTeacherData.profilUrl,
            specialite: editableTeacherData.specialite,
            grade: editableTeacherData.grade,
            telephone: editableTeacherData.telephone,
            departementNam: editableTeacherData.departementNam,
            statut: editableTeacherData.statut,
        });

        console.log('TeacherProfile: Sending enseignant JSON:', enseignantJson);

        formData.append('enseignant', new Blob([enseignantJson], { type: 'application/json' }));

        if (selectedImage) {
            formData.append('file', selectedImage);
        }

        try {
            const updatedTeacher = await updateTeacher(editableTeacherData.enseignantId, formData);
            console.log('TeacherProfile: Saved successfully', updatedTeacher);
            setTeacher(updatedTeacher);
            setEditableTeacherData(updatedTeacher);
            setSelectedImage(null);
            setIsEditing(false);
            setSaveError(null);
        } catch (err) {
            console.error('TeacherProfile: Error saving teacher data:', err);
            setSaveError('Failed to save teacher data.');
        }
    };

    if (loading) {
        return (
            <Container className="mt-5">
                <div className="text-center">Loading...</div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <div className="text-center text-danger">{error}</div>
            </Container>
        );
    }

    if (!teacher) {
        return (
            <Container className="mt-5">
                <div className="text-center">No teacher data found</div>
            </Container>
        );
    }

    return (
        <>
            <Container className="mt-5">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card className="shadow">
                            <Card.Body>
                                <div className="text-center mb-4">
                                    {isEditing ? (
                                        <div className="position-relative">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Profile preview"
                                                    className="rounded-circle mb-3"
                                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div
                                                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto mb-3"
                                                    style={{ width: '150px', height: '150px' }}
                                                >
                                                    <span className="text-white h1">
                                                        {editableTeacherData?.prenom?.[0]}{editableTeacherData?.nom?.[0]}
                                                    </span>
                                                </div>
                                            )}
                                            <Form.Group controlId="formFile" className="mb-3">
                                                <Form.Label>Change Profile Picture</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </Form.Group>
                                        </div>
                                    ) : (
                                        teacher.profilUrl ? (
                                            <img
                                                src={teacher.profilUrl}
                                                alt={`${teacher.prenom} ${teacher.nom}`}
                                                className="rounded-circle"
                                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div
                                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto"
                                                style={{ width: '150px', height: '150px' }}
                                            >
                                                <span className="text-white h1">
                                                    {teacher.prenom?.[0]}{teacher.nom?.[0]}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>

                                <h2 className="text-center mb-4">
                                    {isEditing ? (
                                        <>
                                            <Form.Control
                                                type="text"
                                                name="prenom"
                                                value={editableTeacherData?.prenom || ''}
                                                onChange={handleInputChange}
                                                placeholder="Prénom"
                                                className="mb-2"
                                            />
                                            <Form.Control
                                                type="text"
                                                name="nom"
                                                value={editableTeacherData?.nom || ''}
                                                onChange={handleInputChange}
                                                placeholder="Nom"
                                            />
                                        </>
                                    ) : (
                                        `${teacher.prenom} ${teacher.nom}`
                                    )}
                                </h2>

                                {saveError && <Alert variant="danger">{saveError}</Alert>}

                                <div className="mb-3">
                                    <strong>Téléphone:</strong>
                                    {isEditing ? (
                                        <Form.Control
                                            type="text"
                                            name="telephone"
                                            value={editableTeacherData?.telephone || ''}
                                            onChange={handleInputChange}
                                            placeholder="Téléphone"
                                        />
                                    ) : (
                                        editableTeacherData?.telephone
                                    )}
                                </div>

                                <div className="mb-3">
                                    <strong>Specialité:</strong> {teacher.specialite}
                                </div>

                                <div className="mb-3">
                                    <strong>Grade:</strong> {teacher.grade}
                                </div>

                                <div className="mb-3">
                                    <strong>Département:</strong> {teacher.departementNam}
                                </div>

                                <div className="mb-3">
                                    <strong>Statut:</strong>{' '}
                                    <Badge bg={teacher.statut === 'ACTIF' ? 'success' : 'warning'}>
                                        {teacher.statut}
                                    </Badge>
                                </div>

                                <div className="text-center mt-4">
                                    {isEditing ? (
                                        <>
                                            <Button variant="primary" onClick={handleSaveClick} className="me-2">Save</Button>
                                            <Button variant="secondary" onClick={handleCancelClick}>Cancel</Button>
                                        </>
                                    ) : (
                                        <Button variant="secondary" onClick={handleEditClick}>Edit Profile</Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default TeacherProfile; 