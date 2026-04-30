import { Platform } from 'react-native';
import axios from 'axios';

const API_URL = Platform.OS === 'web' 
    ? 'http://localhost:5000/api/reviews' 
    : 'http://192.168.1.7:5000/api/reviews';

export const getReviewsAPI = async (targetId) => {
    return await axios.get(`${API_URL}/${targetId}`);
};

export const getMyReviewsAPI = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    return await axios.get(`${API_URL}/me`, config);
};

export const addReviewAPI = async (reviewData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    if (Platform.OS !== 'web') {
        config.headers['Content-Type'] = 'multipart/form-data';
    }
    return await axios.post(API_URL, reviewData, config);
};

export const updateReviewAPI = async (id, reviewData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    return await axios.put(`${API_URL}/${id}`, reviewData, config);
};

export const deleteReviewAPI = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    return await axios.delete(`${API_URL}/${id}`, config);
};
