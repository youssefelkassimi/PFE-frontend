import axios from 'axios';

const API_URL = 'http://localhost:8080/api/students';

export const getStudentByUserId = async (userId) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/${userId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const downloadSchoolCertificate = async (codeApj) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/${codeApj}/certificate`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            responseType: 'blob' // Important for handling PDF download
        });
        
        // Create a blob from the PDF data
        const blob = new Blob([response.data], { type: 'application/pdf' });
        
        // Create a link element and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'certificat_scolarite.pdf');
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
    } catch (error) {
        throw error;
    }
};

export const getStudentsByFiliere = async (filiereId) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/filiere/${filiereId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getStudentNotes = async (studentId, moduleId) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/${studentId}/notes/${moduleId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const downloadStudentBulletin = async (studentId, filiereId, semester) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/${studentId}/bulletin`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                filiereId: filiereId,
                semester: semester
            },
            responseType: 'blob'
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `bulletin_${studentId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw error;
    }
};