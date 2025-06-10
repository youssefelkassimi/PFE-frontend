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
import { FaEdit, FaTrash, FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AnneeUniversitaire = () => {
  const [annees, setAnnees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnee, setSelectedAnnee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    annee: '',
    dateDebut: '',
    dateFin: '',
    anneeCourante: false
  });

  useEffect(() => {
    fetchAnnees();
  }, []);

  const showMessage = (type, message) => {
    setToastMessage({ type, message });
    setShowToast(true);
  };

  const fetchAnnees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/annees-universitaires', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setAnnees(response.data);
      showMessage('success', 'Liste des années universitaires chargée avec succès');
    } catch (error) {
      console.error('Error fetching annees universitaires:', error);
      showMessage('error', 'Erreur lors du chargement des années universitaires');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAnnee) {
        await axios.put(`http://localhost:8080/api/annees-universitaires/${selectedAnnee.anneeId}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        showMessage('success', 'Année universitaire modifiée avec succès');
      } else {
        await axios.post('http://localhost:8080/api/annees-universitaires', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        showMessage('success', 'Année universitaire ajoutée avec succès');
      }
      setShowModal(false);
      fetchAnnees();
      resetForm();
    } catch (error) {
      console.error('Error saving annee universitaire:', error);
      showMessage('error', 'Erreur lors de l\'enregistrement de l\'année universitaire');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette année universitaire ?')) {
      try {
        await axios.delete(`http://localhost:8080/api/annees-universitaires/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        showMessage('success', 'Année universitaire supprimée avec succès');
        fetchAnnees();
      } catch (error) {
        console.error('Error deleting annee universitaire:', error);
        showMessage('error', 'Erreur lors de la suppression de l\'année universitaire');
      }
    }
  };

  const handleEdit = (annee) => {
    setSelectedAnnee(annee);
    setFormData({
      annee: annee.annee,
      dateDebut: annee.dateDebut,
      dateFin: annee.dateFin,
      anneeCourante: annee.anneeCourante
    });
    setShowModal(true);
  };

  const handleSetCurrent = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/annees-universitaires/${id}/set-current`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      showMessage('success', 'Année universitaire courante définie avec succès');
      fetchAnnees();
    } catch (error) {
      console.error('Error setting current annee universitaire:', error);
      showMessage('error', 'Erreur lors de la définition de l\'année universitaire courante');
    }
  };

  const resetForm = () => {
    setFormData({
      annee: '',
      dateDebut: '',
      dateFin: '',
      anneeCourante: false
    });
    setSelectedAnnee(null);
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
          <h3 className="mb-0">Gestion des Années Universitaires</h3>
          <Button 
            variant="light" 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="d-flex align-items-center gap-2"
          >
            <FaPlus /> Ajouter une Année Universitaire
          </Button>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Chargement des années universitaires...</p>
            </div>
          ) : (
            <Table striped bordered hover responsive className="align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Année</th>
                  <th>Date Début</th>
                  <th>Date Fin</th>
                  <th>Année Courante</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {annees.map((annee) => (
                  <tr key={annee.anneeId}>
                    <td>{annee.annee}</td>
                    <td>{annee.dateDebut}</td>
                    <td>{annee.dateFin}</td>
                    <td>
                      <Badge bg={annee.anneeCourante ? 'success' : 'danger'}>
                        {annee.anneeCourante ? <FaCheckCircle /> : <FaTimesCircle />}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleEdit(annee)}
                          title="Modifier"
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(annee.anneeId)}
                          title="Supprimer"
                        >
                          <FaTrash />
                        </Button>
                        {!annee.anneeCourante && (
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => handleSetCurrent(annee.anneeId)}
                            title="Définir comme année courante"
                          >
                            Définir Courante
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
          <Modal.Title>{selectedAnnee ? 'Modifier l\'Année Universitaire' : 'Ajouter une Année Universitaire'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Année (AAAA-AAAA)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.annee}
                    onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                    required
                    pattern="^\\d{4}-\\d{4}$"
                    title="Format attendu: AAAA-AAAA (ex: 2023-2024)"
                    placeholder="Entrez l\'année universitaire"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date Début</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date Fin</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="annee-courante-switch"
                    label="Année Courante"
                    checked={formData.anneeCourante}
                    onChange={(e) => setFormData({ ...formData, anneeCourante: e.target.checked })}
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
                {selectedAnnee ? (
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

export default AnneeUniversitaire; 