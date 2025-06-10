import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom'; // Import hooks from react-router-dom
import axios from 'axios'; // Import axios
import { Container, Table, Alert, Form, Button, Spinner } from 'react-bootstrap'; // Import Bootstrap components
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { useAuth } from '../context/AuthContext'; // Import useAuth to get user info
import { getTeacherByUserId, getModuleGradeStatistics, getFilieresByEnseignantId, getModuleById } from '../services/teacherService'; // Import the teacher service

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const TeacherModuleNotesPage = () => {
    const { moduleId } = useParams(); // Get moduleId from URL parameters
    const location = useLocation(); // Get location object to access query params
    const [studentNotes, setStudentNotes] = useState([]);
    const [editableStudentNotes, setEditableStudentNotes] = useState([]); // State for editable notes
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [session, setSession] = useState('NORMAL'); // State for selected session, default to NORMAL
    const [saving, setSaving] = useState(false); // State for saving process
    const [saveError, setSaveError] = useState(null); // State for save errors
    const [teacherId, setTeacherId] = useState(null); // State to store the teacher's ID
    const [loadingTeacher, setLoadingTeacher] = useState(true); // State for loading teacher info
    const [teacherError, setTeacherError] = useState(null); // State for teacher fetch errors
    const [gradeStatistics, setGradeStatistics] = useState(null); // State for module grade statistics
    const [loadingStatistics, setLoadingStatistics] = useState(true); // State for loading statistics
    const [statisticsError, setStatisticsError] = useState(null); // State for statistics fetch errors
    const [isModuleEditable, setIsModuleEditable] = useState(true); // New state to control editability

    // Extract filiereId, semester, and hasTp from query parameters
    const searchParams = new URLSearchParams(location.search);
    const filiereId = searchParams.get('filiereId');
    const semester = searchParams.get('semester');
    const hasTp = searchParams.get('hasTp') === 'true'; // Get hasTp and convert to boolean

    const { user } = useAuth(); // Get the user object

    // Define the fetch function outside of useEffect so it can be called manually
    const fetchStudentNotes = async (currentSession) => {
        // Check if all necessary parameters and user info are available
        if (!moduleId || !filiereId || !semester || !user || !user.userId) {
            setLoading(false);
            setError('Missing required information to fetch notes.');
            return;
        }

        setLoading(true);
        setError(null);
        setStudentNotes([]);
        setEditableStudentNotes([]);

        try {
            const accessToken = localStorage.getItem('accessToken');
            // Assumed backend endpoint for fetching notes by session
            // Using the currentSession parameter to ensure the correct session is fetched
            const response = await axios.get(`http://localhost:8080/api/students/module/${moduleId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                params: {
                    filiereId: filiereId,
                    semester: semester,
                    sessionType: currentSession,
                },
            });
            setStudentNotes(response.data);
            setEditableStudentNotes(response.data);
            console.log('TeacherModuleNotesPage: fetched student notes data:', response.data);
        } catch (err) {
            console.error(`Error fetching student notes for ${currentSession} session:`, err);
            setError(`Failed to load student notes for ${currentSession} session.`);
            setStudentNotes([]);
            setEditableStudentNotes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
     
        if (user && user.userId) {
            fetchStudentNotes(session);

            const checkAuthorization = async () => {
                setLoadingTeacher(true);
                setTeacherError(null);
                try {
                    const teacherData = await getTeacherByUserId(user.userId);
                    if (teacherData && teacherData.enseignantId) {
                        setTeacherId(teacherData.enseignantId);

                        if (user.userRole === 'ROLE_CHEF_FILIERE') {
                        
                            const currentModule = await getModuleById(moduleId);
                            if (currentModule && currentModule.enseignantid === teacherData.enseignantId) {
                                setIsModuleEditable(true);
                            } else {
                                setIsModuleEditable(false);
                            }
                        } else if (user.userRole === 'ROLE_TEACHER') {
                          
                            setIsModuleEditable(true);
                        }
                    } else {
                        setTeacherError('Teacher information not found for this user.');
                        setIsModuleEditable(false); 
                    }
                } catch (err) {
                    console.error('Error fetching teacher info or authorization:', err);
                    setTeacherError('Failed to load teacher information or authorize module.');
                    setIsModuleEditable(false);
                } finally {
                    setLoadingTeacher(false);
                }
            };

            checkAuthorization();
        }
    }, [moduleId, filiereId, semester, session, user, user.userRole]); 

    useEffect(() => {
        const fetchStatistics = async () => {
            if (!moduleId || !filiereId || !semester) return;

            setLoadingStatistics(true);
            setStatisticsError(null);
            try {
                const stats = await getModuleGradeStatistics(moduleId, filiereId, semester, session);
                setGradeStatistics(stats);
            } catch (err) {
                console.error('Error fetching grade statistics:', err);
                setStatisticsError('Failed to load module statistics.');
            } finally {
                setLoadingStatistics(false);
            }
        };

        fetchStatistics();
    }, [moduleId, filiereId, semester, session]);

    useEffect(() => {
        console.log('TeacherModuleNotesPage: teacherId after fetch', teacherId);
    }, [teacherId]);

    const handleNoteChange = (index, field, value) => {
        const updatedNotes = [...editableStudentNotes];
    
        const numericValue = value === '' ? null : parseFloat(value);

        if (numericValue !== null && (numericValue < 0.0 || numericValue > 20.0)) {
        
            console.warn('Note value out of range (0.0 to 20.0)');
            
            return;
        }

        updatedNotes[index][field] = numericValue;
        setEditableStudentNotes(updatedNotes);
    };

    const handleSaveNotes = async () => {
        console.log('TeacherModuleNotesPage: handleSaveNotes called');
        console.log('TeacherModuleNotesPage: user.userId', user?.userId);
        console.log('TeacherModuleNotesPage: teacherId', teacherId);
        setSaving(true);
        setSaveError(null);

        // Prepare data for saving, including only relevant fields for the backend DTO
        const notesToSave = editableStudentNotes.map(student => ({
             // Assuming backend expects EtudiantNoteDto structure for saving
             codeApj: student.codeApj,
             nom: student.nom,
             prenom: student.prenom,
             noteExam: student.noteExam,
             // Include noteTp only if applicable and not null
             noteTp: (hasTp && session === 'NORMAL' && student.noteTp !== null) ? student.noteTp : null
             // Note: Backend might need idModule, idEnseignant, idFiliere, typeExamen for each student object
             // in the list, or as separate request parameters/path variables. Check your backend API spec.
             // Based on your endpoint `/api/notes/insert` with params, sending parameters separately.
        }));

        // Check if there are notes to save
        if (notesToSave.length === 0) {
            setSaving(false);
            setSaveError('No notes to save.');
            return;
        }

        // Validate all notes before saving
        const isValid = notesToSave.every(note => {
            const examValid = note.noteExam === null || (note.noteExam >= 0.0 && note.noteExam <= 20.0);
            const tpValid = note.noteTp === null || (note.noteTp >= 0.0 && note.noteTp <= 20.0);
            return examValid && tpValid;
        });

        if (!isValid) {
             setSaving(false);
             setSaveError('Please ensure all notes are between 0.0 and 20.0.');
             return;
        }

        // Ensure teacherId is available before saving
        if (teacherId === null) {
             setSaving(false);
             setSaveError('Teacher information is not available. Cannot save notes.');
             return;
        }

        try {
             const accessToken = localStorage.getItem('accessToken');
             // Use the provided backend endpoint for saving notes
            await axios.post(`http://localhost:8080/api/notes/insert`, notesToSave, {
                 headers: {
                     'Authorization': `Bearer ${accessToken}`,
                     'Content-Type': 'application/json' // Ensure Content-Type is application/json
                 },
                 params: { // Pass required parameters as query parameters
                     idModule: moduleId, // Use moduleId from URL params
                     idEnseignant: teacherId, // Use the fetched teacher's ID
                     idFiliere: filiereId, // Use filiereId from query params
                     typeExamen: session // Use selected session as typeExamen
                 },
            });
            setSaving(false);
            alert('Notes saved successfully!');
            // Optionally refetch the saved notes to update the displayed values
             // fetchStudentNotes(session); // Refetch after successful save
        } catch (err) {
            console.error('Error saving student notes:', err.response?.data || err.message); // Log backend error response
            setSaving(false);
            setSaveError(`Failed to save student notes: ${err.response?.data || err.message}`); // Display error message from backend if available
        }
    };

    if (loading || loadingTeacher) {
        return <Container className="mt-5"><div className="text-center"><Spinner animation="border" size="sm" className="me-2"/>Loading student notes...</div></Container>;
    }

    if (error || teacherError || statisticsError) {
        return <Container className="mt-5"><Alert variant="danger">{error || teacherError || statisticsError}</Alert></Container>;
    }

    if (!editableStudentNotes || editableStudentNotes.length === 0) {
         if (!loading && !error && !loadingTeacher && !teacherError && !loadingStatistics && !statisticsError) {
            return <Container className="mt-5"><div className="text-center">No student notes found for this module or session.</div></Container>;
         }
         return null;
    }

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Student Notes</h1>

            {gradeStatistics && (
                <div className="mb-4">
                    <h4>Module Grade Statistics</h4>
                    {/* Bar Chart for Grades */}
                    <h5 className="mt-3 mb-2">Grade Distribution</h5>
                    <div style={{ maxWidth: '500px', margin: 'auto' }}>
                        <Bar
                            data={{
                                labels: gradeStatistics.gradeDistribution.map(g => g.grade),
                                datasets: [
                                    {
                                        label: 'Number of Students',
                                        data: gradeStatistics.gradeDistribution.map(g => g.count),
                                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                        borderColor: 'rgba(54, 162, 235, 1)',
                                        borderWidth: 1
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: 'top' },
                                    title: { display: false, text: 'Module Grades' },
                                },
                                scales: {
                                    y: { beginAtZero: true, max: 20 },
                                },
                            }}
                        />
                    </div>

                    {/* Doughnut Chart for Pass/Fail Rate */}
                    <h5 className="mt-4 mb-2">Pass/Fail Rate</h5>
                    <div style={{ maxWidth: '400px', margin: 'auto' }}>
                        <Doughnut
                            data={{
                                labels: ['Passed', 'Failed'],
                                datasets: [
                                    {
                                        label: 'Number of Students',
                                        data: [
                                            gradeStatistics.passedCount,
                                            gradeStatistics.failedCount
                                        ],
                                        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                                        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                                        borderWidth: 1,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: 'right' },
                                    title: { display: false, text: 'Pass/Fail Rate' },
                                },
                            }}
                        />
                    </div>
                    <div className="text-center mt-3">
                        <p><strong>Pass Rate:</strong> {gradeStatistics.passRate.toFixed(2)}%</p>
                    </div>
                </div>
            )}

            <Form.Group className="mb-3">
                <Form.Label>Session Type:</Form.Label>
                <Form.Select value={session} onChange={(e) => setSession(e.target.value)} disabled={saving || !isModuleEditable}> {/* Disable if saving or not editable */}
                    <option value="NORMAL">Normal Session</option>
                    <option value="RATTRAPAGE">Rattrapage Session</option>
                </Form.Select>
            </Form.Group>

            {saveError && <Alert variant="danger">{saveError}</Alert>}

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Code APJ</th>
                        <th>Name</th>
                        <th>Surname</th>
                        <th>Exam Note</th>
                        {hasTp && session === 'NORMAL' && (
                            <th>TP Note</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {editableStudentNotes.map((student, index) => (
                        <tr key={student.codeApj}>
                            <td>{student.codeApj}</td>
                            <td>{student.nom}</td>
                            <td>{student.prenom}</td>
                            <td>
                                <Form.Control
                                    type="number"
                                    min="0.0" max="20.0"
                                    step="0.01"
                                    value={student.noteExam === null ? '' : student.noteExam}
                                    onChange={(e) => handleNoteChange(index, 'noteExam', e.target.value)}
                                    disabled={!isModuleEditable} // Disable if not editable
                                />
                            </td>
                            {hasTp && session === 'NORMAL' && (
                                <td>
                                    <Form.Control
                                        type="number"
                                        min="0.0" max="20.0"
                                        step="0.01"
                                        value={student.noteTp === null ? '' : student.noteTp}
                                        onChange={(e) => handleNoteChange(index, 'noteTp', e.target.value)}
                                        disabled={!isModuleEditable} // Disable if not editable
                                    />
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Button
                variant="success"
                onClick={handleSaveNotes}
                className="mb-3"
                disabled={saving || !isModuleEditable} // Disable if saving or not editable
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
                    'Save Notes'
                )}
            </Button>

        </Container>
    );
};

export default TeacherModuleNotesPage; 