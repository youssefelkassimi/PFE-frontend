import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Card, Alert, Row, Col, Image } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import custom CSS for specific styles
import logo from '../assets/logo.png'; // Import your logo
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Load saved username from localStorage on component mount
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      
      // Handle role-based redirection
      switch (response.userRole) {
        case 'ROLE_TEACHER':
          navigate('/teacher/profile');
          break;
        case 'ROLE_ADMIN':
          navigate('/admin/profile');
          break;
        case 'ROLE_CHEF_FILIERE':
          navigate('/chef-filiere/profile');
          break;
        case 'ROLE_STUDENT':
          navigate('/student/profile');
          break;
        // Add other role-based redirections as needed
        default:
          navigate('/');
      }
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-page-container">
      <Container className="d-flex align-items-center justify-content-center login-container">
        <Card className="login-card">
          <Card.Body>
            <div className="text-center mb-4">
              {/* Replace with your actual logo image */}
              <Image src={logo} alt="Logo" className="login-logo" fluid />
              {/* <div className="login-logo-placeholder">Votre Logo Ici</div> */}
              <h2 className="text-center login-title">Connectez-vous à votre compte</h2>
            </div>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicUsername">
                <Form.Label>Nom d'utilisateur</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Row className="mb-4">
                <Col>
                  <Form.Group className="mb-0" controlId="formBasicCheckbox">
                    <Form.Check 
                      type="checkbox" 
                      label="Se souvenir de moi" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                  </Form.Group>
                </Col>
                <Col className="text-end">
                  <a href="#" className="forgot-password-link">Mot de passe oublié ?</a>
                </Col>
              </Row>

              <Button variant="primary" type="submit" className="w-100 login-button">
                Connexion
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Login; 