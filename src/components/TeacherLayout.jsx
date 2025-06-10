import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';

const TeacherLayout = () => {
    return (
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand href="#home">Teacher Dashboard</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <NavLink to="/teacher/profile" className="nav-link">
                                Profile
                            </NavLink>
                            <NavLink to="/teacher/modules" className="nav-link">
                                Modules
                            </NavLink>
                            <NavLink to="/teacher/individual-notes" className="nav-link">
                                Notes
                            </NavLink>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Outlet /> {/* This is where the nested routes will be rendered */}
        </>
    );
};

export default TeacherLayout; 