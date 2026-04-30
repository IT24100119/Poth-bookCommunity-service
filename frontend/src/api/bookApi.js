import { Platform } from 'react-native';
import axios from 'axios';

const API_URL = Platform.OS === 'web' 
    ? 'http://localhost:5000/api/books' 
    : 'http://192.168.1.7:5000/api/books';

export const getBooksAPI = async () => {
    return await axios.get(API_URL);
};

export const getBookByIdAPI = async (id) => {
    return await axios.get(`${API_URL}/${id}`);
};

export const getBooksByShopAPI = async (shopId) => {
    return await axios.get(`${API_URL}/shop/${shopId}`);
};

export const createBookAPI = async (bookData) => {
    const isFormData = bookData instanceof FormData;
    const config = {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' } 
    };

    if (Platform.OS === 'web' && isFormData) {
        delete config.headers['Content-Type'];
    }

    return await axios.post(API_URL, bookData, config);
};

export const updateBookAPI = async (id, bookData) => {
    return await axios.put(`${API_URL}/${id}`, bookData, { headers: { 'Content-Type': 'application/json' } });
};

export const deleteBookAPI = async (id) => {
    return await axios.delete(`${API_URL}/${id}`);
};
