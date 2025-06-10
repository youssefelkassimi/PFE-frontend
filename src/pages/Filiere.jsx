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
  Dropdown,
  Toast,
  ToastContainer,
  Spinner
} from 'react-bootstrap';
import axios from 'axios';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPlus } from 'react-icons/fa';

const Filiere = () => {
  const [filieres, setFilieres] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    dureeEtudes: '',
    niveau: '',
    departementNam: '',
    chefFiliereId: '',
    active: true
  });

  const niveaux = [
    { value: 'DEUST', label: 'Diplôme d\'Études Universitaires Scientifiques et Techniques' },
    { value: 'LST', label: 'Licence Sciences et Techniques' },
    { value: 'CYCLE', label: 'Cycle d\'Ingénieur' },
    { value: 'MASTER', label: 'Master' },
    { value: 'DOCTORAT', label: 'Doctorat' }
  ];

  useEffect(() => {
    fetchFilieres();
  }, []);

  const showMessage = (type, message) => {
    setToastMessage({ type, message });
    setShowToast(true);
  };

  const fetchFilieres = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/filieres', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      console.log(response.data);
      setFilieres(response.data);
      showMessage('success', 'Liste des filières chargée avec succès');
    } catch (error) {
      console.error('Error fetching filieres:', error);
      showMessage('error', 'Erreur lors du chargement des filières');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedFiliere) {
        await axios.put(`http://localhost:8080/api/filieres/${selectedFiliere.filiereId}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        showMessage('success', 'Filière modifiée avec succès');
      } else {
        await axios.post('http://localhost:8080/api/filieres', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        showMessage('success', 'Filière ajoutée avec succès');
      }
      setShowModal(false);
      fetchFilieres();
      resetForm();
    } catch (error) {
      console.error('Error saving filiere:', error);
      showMessage('error', 'Erreur lors de l\'enregistrement de la filière');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette filière ?')) {
      try {
        await axios.delete(`http://localhost:8080/api/filieres/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        showMessage('success', 'Filière supprimée avec succès');
        fetchFilieres();
      } catch (error) {
        console.error('Error deleting filiere:', error);
        showMessage('error', 'Erreur lors de la suppression de la filière');
      }
    }
  };

  const handleEdit = (filiere) => {
    setSelectedFiliere(filiere);
    setFormData({
      nom: filiere.nom,
      description: filiere.description,
      dureeEtudes: filiere.dureeEtudes,
      niveau: filiere.niveau,
      departementNam: filiere.departement?.nom || '',
      chefFiliereId: filiere.chefFiliere?.id || '',
      active: filiere.active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      dureeEtudes: '',
      niveau: '',
      departementNam: '',
      chefFiliereId: '',
      active: true
    });
    setSelectedFiliere(null);
  };

  const handleActivate = async (id) => {
    try {
      await axios.post(`http://localhost:8080/api/filieres/${id}/activate`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      showMessage('success', 'Filière activée avec succès');
      fetchFilieres();
    } catch (error) {
      console.error('Error activating filiere:', error);
      showMessage('error', 'Erreur lors de l\'activation de la filière');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await axios.post(`http://localhost:8080/api/filieres/${id}/deactivate`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      showMessage('success', 'Filière désactivée avec succès');
      fetchFilieres();
    } catch (error) {
      console.error('Error deactivating filiere:', error);
      showMessage('error', 'Erreur lors de la désactivation de la filière');
    }
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
          <h3 className="mb-0">Gestion des Filières</h3>
          <Button 
            variant="light" 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="d-flex align-items-center gap-2"
          >
            <FaPlus /> Ajouter une Filière
          </Button>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Chargement des filières...</p>
            </div>
          ) : (
            <Table striped bordered hover responsive className="align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Durée</th>
                  <th>Niveau</th>
                  <th>Département</th>
                  <th>Chef de Filière</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filieres.map((filiere) => (
                  <tr key={filiere.filiereId}>
                    <td>{filiere.nom}</td>
                    <td>{filiere.description}</td>
                    <td>{filiere.dureeEtudes}</td>
                    <td>{filiere.niveau}</td>
                    <td>{filiere.departement?.nom}</td>
                    <td>{filiere.chefFiliere?.nom} {filiere.chefFiliere?.prenom}</td>
                    <td>
                      <Badge bg={filiere.active ? 'success' : 'danger'} className="px-3 py-2">
                        {filiere.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleEdit(filiere)}
                          title="Modifier"
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(filiere.filiereId)}
                          title="Supprimer"
                        >
                          <FaTrash />
                        </Button>
                        {filiere.active ? (
                          <Button 
                            variant="outline-warning" 
                            size="sm"
                            onClick={() => handleDeactivate(filiere.filiereId)}
                            title="Désactiver"
                          >
                            <FaToggleOff />
                          </Button>
                        ) : (
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => handleActivate(filiere.filiereId)}
                            title="Activer"
                          >
                            <FaToggleOn />
                          </Button>
                        )}
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
          <Modal.Title>{selectedFiliere ? 'Modifier la Filière' : 'Ajouter une Filière'}</Modal.Title>
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
                    placeholder="Entrez le nom de la filière"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Niveau</Form.Label>
                  <Form.Select
                    value={formData.niveau}
                    onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner un niveau</option>
                    {niveaux.map((niveau) => (
                      <option key={niveau.value} value={niveau.value}>
                        {niveau.label}
                      </option>
                    ))}
                  </Form.Select>
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
                placeholder="Entrez la description de la filière"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Durée des études (années)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.dureeEtudes}
                    onChange={(e) => setFormData({ ...formData, dureeEtudes: e.target.value })}
                    required
                    min="1"
                    max="10"
                    placeholder="Entrez la durée en années"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Département</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.departementNam}
                    onChange={(e) => setFormData({ ...formData, departementNam: e.target.value })}
                    required
                    placeholder="Entrez le nom du département"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Chef de Filière ID</Form.Label>
              <Form.Control
                type="number"
                value={formData.chefFiliereId}
                onChange={(e) => setFormData({ ...formData, chefFiliereId: e.target.value })}
                placeholder="Entrez l'ID du chef de filière"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="active-switch"
                label="Active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
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
                {selectedFiliere ? (
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

export default Filiere; 