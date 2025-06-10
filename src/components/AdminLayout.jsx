import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/admin/profile">Admin Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/admin/profile">Profile</Nav.Link>
              <Nav.Link as={Link} to="/admin/filiere">Filiere</Nav.Link>
              <Nav.Link as={Link} to="/admin/enseignant">Enseignant</Nav.Link>
              <Nav.Link as={Link} to="/admin/departement">Departement</Nav.Link>
              <Nav.Link as={Link} to="/admin/module">Module</Nav.Link>
              <Nav.Link as={Link} to="/admin/inscription">Inscription</Nav.Link>
              <Nav.Link as={Link} to="/admin/annee-universitaire">Année Universitaire</Nav.Link>
              <Nav.Link as={Link} to="/admin/etudiants">Étudiants</Nav.Link>
              <Nav.Link as={Link} to="/admin/notes">Notes</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid className="px-4">
        <Outlet />
      </Container>
    </>
  );
};

export default AdminLayout; 