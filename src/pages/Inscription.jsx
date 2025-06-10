import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const Inscription = () => {
  const [inscriptions, setInscriptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState(null);
  const [filieres, setFilieres] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [anneesUniversitaires, setAnneesUniversitaires] = useState([]);

  const [formData, setFormData] = useState({
    filiereId: '',
    etudiantId: '',
    anneeUniversitaireId: '',
    statut: 'EN_COURS'
  });

  useEffect(() => {
    fetchInscriptions();
    fetchFilieres();
    fetchEtudiants();
    fetchAnneesUniversitaires();
  }, []);

  const fetchInscriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/inscriptions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setInscriptions(response.data);
    } catch (error) {
      console.error('Error fetching inscriptions:', error);
    } finally {
      setLoading(false);
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
    }
  };

  const fetchEtudiants = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/etudiants', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setEtudiants(response.data);
    } catch (error) {
      console.error('Error fetching etudiants:', error);
    }
  };

  const fetchAnneesUniversitaires = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/annees-universitaires', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setAnneesUniversitaires(response.data);
    } catch (error) {
      console.error('Error fetching annees universitaires:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedInscription) {
        await axios.put(`http://localhost:8080/api/inscriptions/${selectedInscription.id}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
      } else {
        await axios.post('http://localhost:8080/api/inscriptions', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
      }
      setShowModal(false);
      fetchInscriptions();
      resetForm();
    } catch (error) {
      console.error('Error saving inscription:', error);
    }
  };

  const handleEdit = (inscription) => {
    setSelectedInscription(inscription);
    setFormData({
      filiereId: inscription.filiere.id,
      etudiantId: inscription.etudiant.id,
      anneeUniversitaireId: inscription.anneeUniversitaire.id,
      statut: inscription.statut
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette inscription ?')) {
      try {
        await axios.delete(`http://localhost:8080/api/inscriptions/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        fetchInscriptions();
      } catch (error) {
        console.error('Error deleting inscription:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      filiereId: '',
      etudiantId: '',
      anneeUniversitaireId: '',
      statut: 'EN_COURS'
    });
    setSelectedInscription(null);
  };

  const getStatusBadge = (statut) => {
    const variants = {
      'EN_COURS': 'warning',
      'VALIDE': 'success',
      'ANNULE': 'danger'
    };
    return <Badge bg={variants[statut]}>{statut}</Badge>;
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestion des Inscriptions</h2>
        <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
          Ajouter une Inscription
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Étudiant</th>
            <th>Filière</th>
            <th>Année Universitaire</th>
            <th>Statut</th>
            <th>Date d'Inscription</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inscriptions.map((inscription) => (
            <tr key={inscription.id}>
              <td>{inscription.id}</td>
              <td>{inscription.etudiant?.nom} {inscription.etudiant?.prenom}</td>
              <td>{inscription.filiere?.nom}</td>
              <td>{inscription.anneeUniversitaire?.annee}</td>
              <td>{getStatusBadge(inscription.statut)}</td>
              <td>{new Date(inscription.dateInscription).toLocaleDateString()}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEdit(inscription)}
                    title="Modifier"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(inscription.id)}
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

      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedInscription ? 'Modifier une Inscription' : 'Ajouter une Inscription'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Étudiant</Form.Label>
                  <Form.Control
                    as="select"
                    value={formData.etudiantId}
                    onChange={(e) => setFormData({ ...formData, etudiantId: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner un étudiant</option>
                    {etudiants.map((etudiant) => (
                      <option key={etudiant.id} value={etudiant.id}>
                        {etudiant.nom} {etudiant.prenom}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Filière</Form.Label>
                  <Form.Control
                    as="select"
                    value={formData.filiereId}
                    onChange={(e) => setFormData({ ...formData, filiereId: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner une filière</option>
                    {filieres.map((filiere) => (
                      <option key={filiere.id} value={filiere.id}>
                        {filiere.nom}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Année Universitaire</Form.Label>
                  <Form.Control
                    as="select"
                    value={formData.anneeUniversitaireId}
                    onChange={(e) => setFormData({ ...formData, anneeUniversitaireId: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner une année</option>
                    {anneesUniversitaires.map((annee) => (
                      <option key={annee.id} value={annee.id}>
                        {annee.annee}
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
                    <option value="EN_COURS">En Cours</option>
                    <option value="VALIDE">Validé</option>
                    <option value="ANNULE">Annulé</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                {selectedInscription ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Inscription; 