import axios from 'axios';

const API_URL = 'http://localhost:8080/api/enseignants';

export const getTeacherByUserId = async (userId) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getModuleGradeStatistics = async (moduleId, filiereId, semester, sessionType) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(`http://localhost:8080/api/notes/module/${moduleId}/statistics`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                filiereId: filiereId,
                semester: semester,
                sessionType: sessionType
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const uploadTeacherPhoto = async (teacherId, photoFile) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('photo', photoFile);

        const response = await axios.post(`${API_URL}/${teacherId}/photo`, formData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getFilieresByEnseignantId = async (enseignantId) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(`http://localhost:8080/api/filieres/${enseignantId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getModuleById = async (moduleId) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(`http://localhost:8080/api/modules/${moduleId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}; 