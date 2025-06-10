import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';

const ChefFiliereLayout = () => {
    return (
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand href="#home">Chef Filiere Dashboard</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <NavLink to="/chef-filiere/profile" className="nav-link">
                                Profile
                            </NavLink>
                            <NavLink to="/chef-filiere/filiere" className="nav-link">
                                Filiere
                            </NavLink>
                            <NavLink to="/chef-filiere/modules" className="nav-link">
                                Modules
                            </NavLink>
                            <NavLink to="/chef-filiere/notes" className="nav-link">
                                Notes
                            </NavLink>
                            <NavLink to="/chef-filiere/students" className="nav-link">
                                Students
                            </NavLink>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Outlet /> {/* This is where the nested routes will be rendered */}
        </>
    );
};

export default ChefFiliereLayout; 