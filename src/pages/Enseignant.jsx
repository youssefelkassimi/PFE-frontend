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

const Enseignant = () => {
  const [enseignants, setEnseignants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEnseignant, setSelectedEnseignant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    departementNam: '',
    statut: '',
    grade: '',
    specialite: '',
    isFiliereChef: false,
  });

  // State for dropdown data
  const [departements, setDepartements] = useState([]);

  useEffect(() => {
    fetchEnseignants();
    fetchDepartements(); // Fetch departments for the dropdown
  }, []);

  const fetchDepartements = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/departements', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setDepartements(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      showMessage('error', 'Erreur lors du chargement des départements pour le formulaire');
    }
  };

  const showMessage = (type, message) => {
    setToastMessage({ type, message });
    setShowToast(true);
  };

  const fetchEnseignants = async () => {
    try {
      setLoading(true);
      // Assuming an endpoint to get all teachers
      const response = await axios.get('http://localhost:8080/api/enseignants', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      console.log(response.data);
      setEnseignants(response.data);
      showMessage('success', 'Liste des enseignants chargée avec succès');
    } catch (error) {
      console.error('Error fetching enseignants:', error);
      showMessage('error', 'Erreur lors du chargement des enseignants');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEnseignant) {
        // Assuming endpoint for updating teacher includes ID
        await axios.put(`http://localhost:8080/api/enseignants/${selectedEnseignant.id}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        showMessage('success', 'Enseignant modifié avec succès');
      } else {
        // Assuming endpoint for adding new teacher
        // Constructing URLSearchParams for @RequestParam backend
        const params = new URLSearchParams();
        params.append('email', formData.email);
        params.append('nom', formData.nom);
        params.append('prenom', formData.prenom);
        params.append('departementNom', formData.departementNam);
        params.append('statut', formData.statut);
        params.append('grade', formData.grade);
        params.append('specialite', formData.specialite);
        params.append('isFiliereChef', formData.isFiliereChef);

        await axios.post('http://localhost:8080/api/admin/teacher', params, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/x-www-form-urlencoded' // Specify content type
          }
        });
        showMessage('success', 'Enseignant ajouté avec succès');
      }
      setShowModal(false);
      fetchEnseignants();
      resetForm();
    } catch (error) {
      console.error('Error saving enseignant:', error);
      showMessage('error', 'Erreur lors de l\'enregistrement de l\'enseignant');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      try {
        // Assuming endpoint for deleting teacher includes ID
        await axios.delete(`http://localhost:8080/api/enseignants/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        showMessage('success', 'Enseignant supprimé avec succès');
        fetchEnseignants();
      } catch (error) {
        console.error('Error deleting enseignant:', error);
        showMessage('error', 'Erreur lors de la suppression de l\'enseignant');
      }
    }
  };

  const handleEdit = (enseignant) => {
    setSelectedEnseignant(enseignant);
    setFormData({
      nom: enseignant.nom,
      prenom: enseignant.prenom,
      email: enseignant.email,
      departementNam: enseignant.departementNam || '',
      statut: enseignant.statut || '',
      grade: enseignant.grade || '',
      specialite: enseignant.specialite || '',
      isFiliereChef: enseignant.isFiliereChef || false,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      departementNam: '',
      statut: '',
      grade: '',
      specialite: '',
      isFiliereChef: false,
    });
    setSelectedEnseignant(null);
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
            <h3 className="mb-0">Gestion des Enseignants</h3>
            <Button 
              variant="light" 
              onClick={() => { resetForm(); setShowModal(true); }}
              className="d-flex align-items-center gap-2"
            >
              <FaPlus /> Ajouter un Enseignant
            </Button>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Chargement des enseignants...</p>
              </div>
            ) : (
              <Table striped bordered hover responsive className="align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Département</th>
                    <th>Statut</th>
                    <th>Grade</th>
                    <th>Spécialité</th>
                    <th>Chef de Filière</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enseignants.map((enseignant, index) => (
                    <tr key={enseignant.id || index}><td>{enseignant.nom}</td><td>{enseignant.prenom}</td><td>{enseignant.email}</td><td>{enseignant.departementNam}</td><td>
                        <Badge bg={enseignant.statut === 'ACTIF' ? 'success' : 'danger'}>
                          {enseignant.statut}
                        </Badge>
                      </td><td>{enseignant.grade}</td><td>{enseignant.specialite}</td><td>
                        <Badge bg={enseignant.isFiliereChef ? 'success' : 'secondary'}>
                          {enseignant.isFiliereChef ? 'Oui' : 'Non'}
                        </Badge>
                      </td><td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(enseignant)}
                            title="Modifier"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(enseignant.id)}
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
            <Modal.Title>{selectedEnseignant ? 'Modifier l\'Enseignant' : 'Ajouter un Enseignant'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                      placeholder="Entrez le nom de l'enseignant"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Prénom</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      required
                      placeholder="Entrez le prénom de l'enseignant"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="Entrez l'email de l'enseignant"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Département</Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.departementNam}
                      onChange={(e) => setFormData({ ...formData, departementNam: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner un département</option>
                      {departements.map((dept) => (
                        <option key={dept.departementId} value={dept.nom}>
                          {dept.nom}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Statut</Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner un statut</option>
                      {[ 'PERMANENT', 'VACATAIRE', 'ASSOCIE', 'INVITE', 'EMERITE' ].map((statut) => (
                        <option key={statut} value={statut}>
                          {statut}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Grade</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      required
                      placeholder="Entrez le grade"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Spécialité</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.specialite}
                      onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                      required
                      placeholder="Entrez la spécialité"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="isFiliereChef-switch"
                      label="Chef de Filière ?"
                      checked={formData.isFiliereChef}
                      onChange={(e) => setFormData({ ...formData, isFiliereChef: e.target.checked })}
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
                  {selectedEnseignant ? (
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

export default Enseignant; 