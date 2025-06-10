import React from 'react';
import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

const AdminLayout = () => {
  return (
    <Nav className="me-auto">
      <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
      <Nav.Link as={Link} to="/admin/enseignants">Enseignants</Nav.Link>
      <Nav.Link as={Link} to="/admin/etudiants">Étudiants</Nav.Link>
      <Nav.Link as={Link} to="/admin/filieres">Filières</Nav.Link>
      <Nav.Link as={Link} to="/admin/modules">Modules</Nav.Link>
      <Nav.Link as={Link} to="/admin/notes">Notes</Nav.Link>
    </Nav>
  );
};

export default AdminLayout; 