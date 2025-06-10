import React from 'react';
import { Container, Card } from 'react-bootstrap';

const Notes = () => {
    return (
        <Container className="mt-5">
            <Card className="shadow">
                <Card.Header className="bg-primary text-white">
                    <h3 className="mb-0">Notes Management</h3>
                </Card.Header>
                <Card.Body>
                    <p>Welcome to the Notes Management page for Admin!</p>
                    <p>This section will allow administrators to manage notes across the school.</p>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Notes; 