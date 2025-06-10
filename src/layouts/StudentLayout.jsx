import React from 'react';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StudentLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div>
            <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
                <Container>
                    <Navbar.Brand as={Link} to="/student">Student Portal</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/student/profile">Profile</Nav.Link>
                            <Nav.Link as={Link} to="/student/notes">Notes</Nav.Link>
                            <Nav.Link as={Link} to="/student/documents">Documents</Nav.Link>
                        </Nav>
                        <Nav>
                            <NavDropdown title="Account" id="basic-nav-dropdown">
                                <NavDropdown.Item as={Link} to="/student/profile">Profile</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container>
                <Outlet />
            </Container>
        </div>
    );
};

export default StudentLayout; 