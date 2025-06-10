import React from 'react';
import { Container, Card } from 'react-bootstrap';

const AdminDashboard = () => {
    return (
        <Container className="mt-5">
            <Card className="shadow">
                <Card.Header className="bg-primary text-white">
                    <h3 className="mb-0">Admin Dashboard</h3>
                </Card.Header>
                <Card.Body>
                    <p>Welcome to the Admin Dashboard!</p>
                    <p>Use the navigation above to manage various aspects of the school.</p>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminDashboard; 