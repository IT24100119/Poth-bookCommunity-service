import { Platform } from 'react-native';
import axios from 'axios';

// Ensure this matches your dev machine IP or localhost if running web.
const API_URL = Platform.OS === 'web'
    ? 'http://localhost:5000/api/orders'
    : 'http://192.168.1.7:5000/api/orders';

const JSON_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

// Create a new order
export const createOrderAPI = async (orderData) => {
    return await axios.post(`${API_URL}`, orderData, { headers: JSON_HEADERS });
};

// Get orders for a specific reader
export const getReaderOrdersAPI = async (readerId) => {
    return await axios.get(`${API_URL}/reader/${readerId}`, { headers: JSON_HEADERS });
};

// Get orders for a specific shop
export const getShopOrdersAPI = async (shopId) => {
    return await axios.get(`${API_URL}/shop/${shopId}`, { headers: JSON_HEADERS });
};

// Update order status
export const updateOrderStatusAPI = async (orderId, status) => {
    return await axios.put(`${API_URL}/${orderId}/status`, { status }, { headers: JSON_HEADERS });
};

// Update order delivery details
export const updateOrderDeliveryAPI = async (orderId, deliveryDetails) => {
    return await axios.put(`${API_URL}/${orderId}/delivery`, { deliveryDetails }, { headers: JSON_HEADERS });
};

// Delete/Cancel an order
export const deleteOrderAPI = async (orderId) => {
    return await axios.delete(`${API_URL}/${orderId}`, { headers: JSON_HEADERS });
};
