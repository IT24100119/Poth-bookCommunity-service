import { Platform } from 'react-native';
import axios from 'axios';

const API_URL = Platform.OS === 'web' 
    ? 'http://localhost:5000/api/shops' 
    : 'http://192.168.1.7:5000/api/shops';

export const getShopsAPI = async () => {
    return await axios.get(API_URL);
};

export const getShopByIdAPI = async (id) => {
    return await axios.get(`${API_URL}/${id}`);
};

export const createShopAPI = async (shopData, token) => {
    return await axios.post(API_URL, shopData, { 
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        } 
    });
};

export const updateShopAPI = async (id, shopData, token) => {
    return await axios.put(`${API_URL}/${id}`, shopData, { 
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        } 
    });
};

export const deleteShopAPI = async (id, token) => {
    return await axios.delete(`${API_URL}/${id}`, { 
        headers: {
            Authorization: `Bearer ${token}` 
        } 
    });
};
