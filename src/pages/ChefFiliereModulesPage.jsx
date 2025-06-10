import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getTeacherByUserId, getModuleGradeStatistics, getFilieresByEnseignantId } from '../services/teacherService'; // Reuse getTeacherByUserId for ChefFiliere if they are stored as teachers
import { Container, Card, ListGroup, Alert, Button, Spinner, Table } from 'react-bootstrap';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const ChefFiliereModulesPage = () => {
    console.log('ChefFiliereModulesPage: Component is rendering.');
    const [modules, setModules] = useState([]);
    const [chefFiliere, setChefFiliere] = useState(null); // State to store ChefFiliere data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [moduleStatistics, setModuleStatistics] = useState({}); // State to store statistics for each module
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('ChefFiliereModulesPage: useEffect is running (full version).');
        const fetchData = async () => {
            if (!user || !user.userId) {
                setLoading(false);
                setError('User not authenticated or user ID not available.');
                console.log('ChefFiliereModulesPage: User not authenticated or user ID not available.', user);
                return;
            }

            try {
                console.log('ChefFiliereModulesPage: Fetching chef filiere data for userId:', user.userId);
                const chefFiliereData = await getTeacherByUserId(user.userId);
                setChefFiliere(chefFiliereData);
                console.log('ChefFiliereModulesPage: chefFiliereData:', chefFiliereData);

                if (!chefFiliereData || !chefFiliereData.enseignantId) {
                    setLoading(false);
                    setError('Chef Filiere enseignantId not found.');
                    console.log('ChefFiliereModulesPage: Chef Filiere enseignantId not found.', chefFiliereData);
                    return;
                }

                const enseignantId = chefFiliereData.enseignantId;
                console.log('ChefFiliereModulesPage: Extracted enseignantId:', enseignantId);

                // 2. Use enseignantId to fetch filiere data
                console.log(`ChefFiliereModulesPage: Fetching filiere data for enseignantId: ${enseignantId}`);
                const filieresResponse = await getFilieresByEnseignantId(enseignantId);
                console.log('ChefFiliereModulesPage: Filieres fetched:', filieresResponse);

                if (!filieresResponse || filieresResponse.length === 0) {
                    setLoading(false);
                    setError('No filiere found for this Chef Filiere.');
                    console.log('ChefFiliereModulesPage: No filiere found for this Chef Filiere.', filieresResponse);
                    return;
                }

                const filiereId = filieresResponse[0].filiereId; // Assuming Chef Filiere has one main filiere
                const filiereNom = filieresResponse[0].nom; // Assuming Chef Filiere has one main filiere
                console.log('ChefFiliereModulesPage: Extracted filiereId:', filiereId);
                console.log('ChefFiliereModulesPage: Extracted filiereNom:', filiereNom);

                // Set chefFiliere state with filiere details
                setChefFiliere(prev => ({ ...prev, filiereID: { filiereId, nomFiliere: filiereNom } }));

                // 3. Use filiereId to fetch modules for this filiere
                const accessToken = localStorage.getItem('accessToken');
                console.log(`ChefFiliereModulesPage: Fetching modules for filiereId: ${filiereId}`);
                const modulesResponse = await axios.get(`http://localhost:8080/api/modules/filiere/${filiereId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setModules(modulesResponse.data);
                console.log('ChefFiliereModulesPage: Modules fetched:', modulesResponse.data);

                // 4. Fetch statistics for each module
                const statsPromises = modulesResponse.data.map(async (module) => {
                    try {
                        const stats = await getModuleGradeStatistics(module.idModule);
                        return { moduleId: module.idModule, stats };
                    } catch (statErr) {
                        console.error(`Error fetching statistics for module ${module.idModule}:`, statErr);
                        return { moduleId: module.idModule, stats: null }; // Indicate error for this module
                    }
                });

                const results = await Promise.all(statsPromises);
                const newModuleStatistics = results.reduce((acc, current) => {
                    acc[current.moduleId] = current.stats;
                    return acc;
                }, {});
                setModuleStatistics(newModuleStatistics);

            } catch (err) {
                console.error('Error fetching data for Chef Filiere Modules:', err);
                setError('Failed to load Chef Filiere modules and statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleViewNotesClick = (module) => {
        navigate(`/chef-filiere/modules/${module.idModule}/notes?filiereId=${module.filiere}&semester=${module.semester}&hasTp=${module.hasTp}`);
    };

    if (loading) {
        return <Container className="mt-5"><div className="text-center"><Spinner animation="border" size="sm" className="me-2"/>Loading modules and statistics...</div></Container>;
    }

    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    if (!chefFiliere) {
        return <Container className="mt-5"><div className="text-center">No Chef Filiere data found.</div></Container>;
    }

    if (modules.length === 0) {
        return <Container className="mt-5"><div className="text-center">No modules found for the filiere.</div></Container>;
    }

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Modules for Filiere: {chefFiliere.filiereID.nomFiliere}</h1>
            <ListGroup>
                {modules.map(module => (
                    <ListGroup.Item key={module.idModule} className="mb-3 p-3">
                        <Card border="info" className="flex-grow-1 mb-3">
                            <Card.Body>
                                <Card.Title className="text-primary">{module.nomModule}</Card.Title>
                                <Card.Text>
                                    <strong>Code:</strong> {module.codeModule}<br/>
                                    <strong>Volume Horaire:</strong> {module.volumeHoraire}<br/>
                                    <strong>Semester:</strong> {module.semester}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                        
                        {moduleStatistics[module.idModule] ? (
                            <Card className="mb-3">
                                <Card.Header className="bg-light">Grade Statistics</Card.Header>
                                <Card.Body>
                                    {/* Bar Chart for Grades */}
                                    <h5 className="mt-3 mb-2">Grade Distribution</h5>
                                    <div style={{ maxWidth: '500px', margin: 'auto' }}>
                                        <Bar
                                            data={{
                                                labels: ['Average', 'Highest', 'Lowest'],
                                                datasets: [
                                                    {
                                                        label: 'Grades',
                                                        data: [
                                                            moduleStatistics[module.idModule].average,
                                                            moduleStatistics[module.idModule].highest,
                                                            moduleStatistics[module.idModule].lowest
                                                        ],
                                                        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'],
                                                        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
                                                        borderWidth: 1,
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
                                                            moduleStatistics[module.idModule].passedCount,
                                                            moduleStatistics[module.idModule].failedCount
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
                                        <p><strong>Pass Rate:</strong> {moduleStatistics[module.idModule].passRate.toFixed(2)}%</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        ) : (
                            <Alert variant="info">Loading statistics or no statistics available for this module.</Alert>
                        )}

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

export default ChefFiliereModulesPage; 