import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Row, 
  Col,
  Card,
  Badge,
  Toast,
  ToastContainer,
  Spinner
} from 'react-bootstrap';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import AdminLayout from '../components/AdminLayout';

const Module = () => {
  const [modules, setModules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    nomModule: '',
    codeModule: '',
    volumeHoraire: '',
    semester: '',
    filiere: '',
    enseignantid: '',
    anneeUniversitaire: '',
    hasTp: false
  });

  // Assuming you have lists of possible semesters, filieres, enseignants, and anneesUniversitaires
  // You would fetch these from your backend API and populate these state variables
  const [semesters, setSemesters] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [anneesUniversitaires, setAnneesUniversitaires] = useState([]);

  useEffect(() => {
    fetchModules();
    fetchAnneesUniversitaires(); // Fetch the list of university years
    fetchFilieres(); // Fetch the list of filieres
    // Fetch lists of semesters and enseignants here
    // Example: fetchSemesters(); fetchEnseignants(); etc.
  }, []);

  const fetchAnneesUniversitaires = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/annees-universitaires', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setAnneesUniversitaires(response.data);
    } catch (error) {
      console.error('Error fetching university years:', error);
      showMessage('error', 'Erreur lors du chargement des années universitaires pour le formulaire');
    }
  };

  const fetchFilieres = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/filieres', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setFilieres(response.data);
    } catch (error) {
      console.error('Error fetching filieres:', error);
      showMessage('error', 'Erreur lors du chargement des filières pour le formulaire');
    }
  };

  const showMessage = (type, message) => {
    setToastMessage({ type, message });
    setShowToast(true);
  };

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/modules', { // Assuming an endpoint to get all modules
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setModules(response.data);
      showMessage('success', 'Liste des modules chargée avec succès');
    } catch (error) {
      console.error('Error fetching modules:', error);
      showMessage('error', 'Erreur lors du chargement des modules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedModule) {
        await axios.put(`http://localhost:8080/api/modules/${selectedModule.idModule}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        showMessage('success', 'Module modifié avec succès');
      } else {
        await axios.post('http://localhost:8080/api/modules', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        showMessage('success', 'Module ajouté avec succès');
      }
      setShowModal(false);
      fetchModules();
      resetForm();
    } catch (error) {
      console.error('Error saving module:', error);
      showMessage('error', 'Erreur lors de l\'enregistrement du module');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      try {
        await axios.delete(`http://localhost:8080/api/modules/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        showMessage('success', 'Module supprimé avec succès');
        fetchModules();
      } catch (error) {
        console.error('Error deleting module:', error);
        showMessage('error', 'Erreur lors de la suppression du module');
      }
    }
  };

  const handleEdit = (module) => {
    setSelectedModule(module);
    setFormData({
      nomModule: module.nomModule,
      codeModule: module.codeModule,
      volumeHoraire: module.volumeHoraire,
      semester: module.semester,
      filiere: module.filiere,
      enseignantid: module.enseignantid,
      anneeUniversitaire: module.anneeUniversitaire,
      hasTp: module.hasTp
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nomModule: '',
      codeModule: '',
      volumeHoraire: '',
      semester: '',
      filiere: '',
      enseignantid: '',
      anneeUniversitaire: '',
      hasTp: false
    });
    setSelectedModule(null);
  };

  return (
      <div className="mt-4">
        <ToastContainer position="top-end" className="p-3">
          <Toast 
            show={showToast} 
            onClose={() => setShowToast(false)} 
            delay={3000} 
            autohide
            bg={toastMessage.type === 'success' ? 'success' : 'danger'}
          >
            <Toast.Header>
              <strong className="me-auto">
                {toastMessage.type === 'success' ? 'Succès' : 'Erreur'}
              </strong>
            </Toast.Header>
            <Toast.Body className="text-white">
              {toastMessage.message}
            </Toast.Body>
          </Toast>
        </ToastContainer>

        <Card className="shadow">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Gestion des Modules</h3>
            <Button 
              variant="light" 
              onClick={() => { resetForm(); setShowModal(true); }}
              className="d-flex align-items-center gap-2"
            >
              <FaPlus /> Ajouter un Module
            </Button>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Chargement des modules...</p>
              </div>
            ) : (
              <Table striped bordered hover responsive className="align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Nom</th>
                    <th>Code</th>
                    <th>Volume Horaire</th>
                    <th>Semestre</th>
                    <th>Filière</th>
                    <th>Enseignant</th>
                    <th>Année Universitaire</th>
                    <th>TP</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((module) => (
                    <tr key={module.idModule}>
                      <td>{module.nomModule}</td>
                      <td>{module.codeModule}</td>
                      <td>{module.volumeHoraire}</td>
                      <td>{module.semester}</td>
                      {/* Displaying Filiere, Enseignant, and AnneeUniversitaire might require fetching their details based on IDs */}
                      <td>
                        {filieres.find(f => f.filiereId === module.filiere)?.nom || module.filiere}
                      </td>
                      <td>{module.enseignantid}</td>
                      <td>{module.anneeUniversitaire}</td>
                      <td>
                        <Badge bg={module.hasTp ? 'success' : 'danger'}>
                          {module.hasTp ? 'Oui' : 'Non'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleEdit(module)}
                            title="Modifier"
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(module.idModule)}
                            title="Supprimer"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg">
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>{selectedModule ? 'Modifier le Module' : 'Ajouter un Module'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.nomModule}
                      onChange={(e) => setFormData({ ...formData, nomModule: e.target.value })}
                      required
                      placeholder="Entrez le nom du module"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Code</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.codeModule}
                      onChange={(e) => setFormData({ ...formData, codeModule: e.target.value })}
                      required
                      placeholder="Entrez le code du module"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Volume Horaire</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.volumeHoraire}
                      onChange={(e) => setFormData({ ...formData, volumeHoraire: e.target.value })}
                      required
                      min="1"
                      placeholder="Entrez le volume horaire"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Semestre</Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner un semestre</option>
                      {/* Using the provided Semester enum values */}
                      {[ 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10' ].map((sem) => (
                        <option key={sem} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Filière</Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.filiere}
                      onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner une filière</option>
                      {filieres.map((filiere) => (
                        <option key={filiere.filiereId} value={filiere.filiereId}>
                          {filiere.nom}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Enseignant ID</Form.Label>
                    {/* This should be a dropdown populated from the enseignants state */}
                    <Form.Control
                      type="number"
                      value={formData.enseignantid}
                      onChange={(e) => setFormData({ ...formData, enseignantid: e.target.value })}
                      placeholder="Entrez l\'ID de l\'enseignant"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Année Universitaire</Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.anneeUniversitaire}
                      onChange={(e) => setFormData({ ...formData, anneeUniversitaire: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner une année universitaire</option>
                      {anneesUniversitaires.map((annee) => (
                        <option key={annee.anneeId} value={annee.anneeId}>
                          {annee.annee}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                   <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="has-tp-switch"
                      label="A TP ?"
                      checked={formData.hasTp}
                      onChange={(e) => setFormData({ ...formData, hasTp: e.target.checked })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => { setShowModal(false); resetForm(); }}
                >
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  className="d-flex align-items-center gap-2"
                >
                  {selectedModule ? (
                    <>
                      <FaEdit /> Modifier
                    </>
                  ) : (
                    <>
                      <FaPlus /> Ajouter
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
  );
};

export default Module; 