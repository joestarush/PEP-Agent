import axios from 'axios';

const API_URL = import.meta.env.BACKEND_API_URL || 'http://localhost:8000';

export const api = {
    loadMockData: () => axios.post(`${API_URL}/inbox/load_mock`),
    getEmails: () => axios.get(`${API_URL}/emails`),
    processEmails: () => axios.post(`${API_URL}/emails/process`),
    getPrompts: () => axios.get(`${API_URL}/config/prompts`),
    updatePrompt: (data) => axios.post(`${API_URL}/config/prompts`, data),
};