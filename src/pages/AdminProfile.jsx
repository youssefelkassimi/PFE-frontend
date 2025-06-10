import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminProfile = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/admin/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <Container className="mt-4">
        <h2 className="mb-4 text-center text-primary">Admin Profile</h2>
        {userData && (
          <Card className="mt-3 shadow-lg">
            <Card.Body>
              <Row>
                <Col md={4} className="text-center">
                  <div style={{ width: '150px', height: '150px', backgroundColor: '#e9ecef', borderRadius: '50%', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#6c757d' }}>
                    {userData.nom ? userData.nom.charAt(0).toUpperCase() : ''}{userData.prenom ? userData.prenom.charAt(0).toUpperCase() : ''}
                  </div>
                  <h4 className="text-break">{userData.nom} {userData.prenom}</h4>
                  <p className="text-muted">{userData.userRole}</p>
                </Col>
                <Col md={8}>
                  <h5 className="mb-3">Personal Information</h5>
                  <Row className="mb-3">
                    <Col xs={12} sm={6}>
                      <p><strong>ID:</strong> {userData.id}</p>
                      <p><strong>Email:</strong> {userData.email}</p>
                      <p><strong>Username:</strong> {userData.username}</p>
                    </Col>
                    <Col xs={12} sm={6}>
                      <p><strong>University Email:</strong> {userData.universityEmail}</p>
                    </Col>
                  </Row>

                  <h5 className="mb-3 mt-3">Professional Information</h5>
                  <Row>
                    <Col xs={12} sm={6}>
                      <p><strong>Specialite:</strong> {userData.specialite}</p>
                    </Col>
                    <Col xs={12} sm={6}>
                      <p><strong>Grade:</strong> {userData.grade}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
      </Container>
    </>
  );
};

export default AdminProfile; 