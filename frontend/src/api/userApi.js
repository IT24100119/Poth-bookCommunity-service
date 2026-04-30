import { Platform } from 'react-native';
import axios from 'axios';

// Ensure this matches your dev machine IP or localhost if running web.
const API_URL = Platform.OS === 'web' 
    ? 'http://localhost:5000/api/users' 
    : 'http://192.168.1.7:5000/api/users';

// Explicit JSON headers — prevents browser preflight issues and ensures body is parsed
const JSON_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

export const registerUserAPI = async (userData) => {
    return await axios.post(`${API_URL}/register`, userData, { headers: JSON_HEADERS });
};

export const loginUserAPI = async (credentials) => {
    return await axios.post(`${API_URL}/login`, credentials, { headers: JSON_HEADERS });
};

export const updateUserAPI = async (userData, token) => {
    return await axios.put(`${API_URL}/profile`, userData, {
        headers: {
            ...JSON_HEADERS,
            Authorization: `Bearer ${token}`
        }
    });
};

export const deleteUserAPI = async (token) => {
    return await axios.delete(`${API_URL}/profile`, {
        headers: {
            ...JSON_HEADERS,
            Authorization: `Bearer ${token}`
        }
    });
};