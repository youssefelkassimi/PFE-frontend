import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getTeacherByUserId } from '../services/teacherService';
import Modal from 'react-bootstrap/Modal';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';

const TeacherIndividualNotesPage = () => {
    const [modules, setModules] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [loadingModules, setLoadingModules] = useState(true);
    const [moduleError, setModuleError] = useState(null);

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [updateNoteValue, setUpdateNoteValue] = useState('');
    const [updateNoteType, setUpdateNoteType] = useState('EXAM');

    const { user } = useAuth();

    useEffect(() => {
        const fetchModules = async () => {
            if (!user || !user.userId) {
                setLoadingModules(false);
                setModuleError('User not authenticated or user ID not available.');
                return;
            }

            try {
                setLoadingModules(true);
                const teacherData = await getTeacherByUserId(user.userId);
                if (!teacherData || !teacherData.enseignantId) {
                    setLoadingModules(false);
                    setModuleError('Teacher data not found or enseignantId missing.');
                    return;
                }

                const enseignantId = parseInt(teacherData.enseignantId, 10);
                if (isNaN(enseignantId)) {
                    setLoadingModules(false);
                    setModuleError('Invalid enseignantId obtained.');
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
                console.error('Error fetching modules:', err);
                setModuleError('Failed to load modules.');
            } finally {
                setLoadingModules(false);
            }
        };

        fetchModules();
    }, [user]);

    const handleFetchNotes = async () => {
        if (!selectedStudentId || !selectedModuleId) {
            setError('Please select both a student ID and a module.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`http://localhost:8080/api/notes/student/${selectedStudentId}/module/${selectedModuleId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            setNotes(response.data);
        } catch (err) {
            console.error('Error fetching notes:', err);
            setError('Failed to fetch notes. Please check the student ID and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            setSaving(true);
            setSaveError(null);
            await axios.delete(`http://localhost:8080/api/notes/${noteId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            setNotes(notes.filter(note => note.id !== noteId));
        } catch (err) {
            console.error('Error deleting note:', err);
            setSaveError('Failed to delete note.');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateNote = async () => {
        if (!selectedNote || !updateNoteValue) {
            setSaveError('Please enter a valid note value.');
            return;
        }

        const numericValue = parseFloat(updateNoteValue);
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 20) {
            setSaveError('Note value must be between 0 and 20.');
            return;
        }

        try {
            setSaving(true);
            setSaveError(null);
            await axios.put(`http://localhost:8080/api/notes/${selectedNote.id}`, {
                note: numericValue,
                type: updateNoteType
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            setNotes(notes.map(note =>
                note.id === selectedNote.id
                    ? { ...note, note: numericValue, type: updateNoteType }
                    : note
            ));
            setShowUpdateModal(false);
        } catch (err) {
            console.error('Error updating note:', err);
            setSaveError('Failed to update note.');
        } finally {
            setSaving(false);
        }
    };

    if (loadingModules) {
        return (
            <Container className="mt-4">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading modules...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    if (moduleError) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    {moduleError}
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h2>Individual Student Notes</h2>
            <Form className="mb-4">
                <Form.Group className="mb-3">
                    <Form.Label>Student ID</Form.Label>
                    <Form.Control
                        type="text"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        placeholder="Enter student ID"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Module</Form.Label>
                    <Form.Select
                        value={selectedModuleId}
                        onChange={(e) => setSelectedModuleId(e.target.value)}
                    >
                        <option value="">Select a module</option>
                        {modules.map(module => (
                            <option key={module.idModule} value={module.idModule}>
                                {module.nomModule}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Button
                    variant="primary"
                    onClick={handleFetchNotes}
                    disabled={loading || !selectedStudentId || !selectedModuleId}
                >
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Loading...
                        </>
                    ) : (
                        'Fetch Notes'
                    )}
                </Button>
            </Form>

            {error && (
                <Alert variant="danger" className="mb-3">
                    {error}
                </Alert>
            )}

            {notes.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Note</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notes.map(note => (
                                <tr key={note.id}>
                                    <td>{note.type}</td>
                                    <td>{note.note}</td>
                                    <td>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => {
                                                setSelectedNote(note);
                                                setUpdateNoteValue(note.note.toString());
                                                setUpdateNoteType(note.type);
                                                setShowUpdateModal(true);
                                            }}
                                        >
                                            Update
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDeleteNote(note.id)}
                                            disabled={saving}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && selectedStudentId && selectedModuleId && (
                    <Alert variant="info">
                        No notes found for this student in the selected module.
                    </Alert>
                )
            )}

            <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Note</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {saveError && (
                        <Alert variant="danger" className="mb-3">
                            {saveError}
                        </Alert>
                    )}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Note Type</Form.Label>
                            <Form.Select
                                value={updateNoteType}
                                onChange={(e) => setUpdateNoteType(e.target.value)}
                            >
                                <option value="EXAM">Exam</option>
                                <option value="TP">TP</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Note Value</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                max="20"
                                value={updateNoteValue}
                                onChange={(e) => setUpdateNoteValue(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpdateNote}
                        disabled={saving}
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
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TeacherIndividualNotesPage; 