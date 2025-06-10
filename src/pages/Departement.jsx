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

const Departement = () => {
  const [departements, setDepartements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartement, setSelectedDepartement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    ChefDepartementUsername: '',
  });

  useEffect(() => {
    fetchDepartements();
  }, []);

  const showMessage = (type, message) => {
    setToastMessage({ type, message });
    setShowToast(true);
  };

  const fetchDepartements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/departements', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setDepartements(response.data);
      showMessage('success', 'Liste des départements chargée avec succès');
    } catch (error) {
      console.error('Error fetching departements:', error);
      showMessage('error', 'Erreur lors du chargement des départements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedDepartement) {
        await axios.put(`http://localhost:8080/api/departements/${selectedDepartement.departementId}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        showMessage('success', 'Département modifié avec succès');
      } else {
        await axios.post('http://localhost:8080/api/departements/add', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        showMessage('success', 'Département ajouté avec succès');
      }
      setShowModal(false);
      fetchDepartements();
      resetForm();
    } catch (error) {
      console.error('Error saving departement:', error);
      showMessage('error', 'Erreur lors de l\'enregistrement du département');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      try {
        await axios.delete(`http://localhost:8080/api/departements/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        showMessage('success', 'Département supprimé avec succès');
        fetchDepartements();
      } catch (error) {
        console.error('Error deleting departement:', error);
        showMessage('error', 'Erreur lors de la suppression du département');
      }
    }
  };

  const handleEdit = (departement) => {
    setSelectedDepartement(departement);
    setFormData({
      nom: departement.nom,
      description: departement.description,
      ChefDepartementUsername: departement.ChefDepartementUsername || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      ChefDepartementUsername: '',
    });
    setSelectedDepartement(null);
  };

  return (
    <Container className="mt-4">
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
          <h3 className="mb-0">Gestion des Départements</h3>
          <Button 
            variant="light" 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="d-flex align-items-center gap-2"
          >
            <FaPlus /> Ajouter un Département
          </Button>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Chargement des départements...</p>
            </div>
          ) : (
            <Table striped bordered hover responsive className="align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Chef de Département</th>
                  <th>Nombre d'Enseignants</th>
                  <th>Nombre de Filières</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departements.map((departement) => (
                  <tr key={departement.departementId}>
                    <td>{departement.nom}</td>
                    <td>{departement.description}</td>
                    <td>{departement.chefDepartementUsername}</td>
                    <td>{departement.nombreEnseignants}</td>
                    <td>{departement.nombreFilieres}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleEdit(departement)}
                          title="Modifier"
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(departement.departementId)}
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
          <Modal.Title>{selectedDepartement ? 'Modifier le Département' : 'Ajouter un Département'}</Modal.Title>
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
                    placeholder="Entrez le nom du département"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Chef de Département</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.ChefDepartementUsername}
                    onChange={(e) => setFormData({ ...formData, ChefDepartementUsername: e.target.value })}
                    placeholder="Entrez le nom d'utilisateur du chef de département"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Entrez la description du département"
              />
            </Form.Group>

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
                {selectedDepartement ? (
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
    </Container>
  );
};

export default Departement; 