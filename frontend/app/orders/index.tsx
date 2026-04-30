import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../src/context/AuthContext';
import { getReaderOrdersAPI, deleteOrderAPI } from '../../src/api/orderApi';

export default function OrdersScreen() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // user._id mapping from context type User
        if (user?._id) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await getReaderOrdersAPI(user._id);
            setOrders(res.data);
        } catch (error) {
            Alert.alert("Error", "Could not fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (orderId) => {
        const performDelete = async () => {
            try {
                await deleteOrderAPI(orderId);
                fetchOrders(); // Refresh list
                if (Platform.OS === 'web') { window.alert("Order cancelled"); }
                else { Alert.alert("Success", "Order cancelled"); }
            } catch (err) {
                if (Platform.OS === 'web') { window.alert("Error: Could not delete order"); }
                else { Alert.alert("Error", "Could not delete order"); }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Cancel Order: Are you sure you want to cancel this order?")) {
                performDelete();
            }
        } else {
            Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
                { text: "No", style: "cancel" },
                { text: "Yes, Cancel", style: "destructive", onPress: performDelete }
            ]);
        }
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Pending': return '#FFC107'; // Yellow
            case 'Confirmed': return '#4CAF50'; // Green
            case 'Shipped': return '#2196F3'; // Blue
            case 'Delivered': return '#9C27B0'; // Purple
            case 'Cancelled': return '#F44336'; // Red
            default: return Colors.light.primary;
        }
    };

    const renderOrderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            <Text style={styles.detailsText}>Book: {item.book?.title || 'Unknown Book'}</Text>
            <Text style={styles.detailsText}>Shop: {item.shop?.name || 'Unknown Shop'}</Text>
            <Text style={styles.detailsText}>Quantity: {item.quantity}</Text>
            <Text style={styles.detailsText}>Total: Rs. {item.totalPrice}</Text>

            {item.status === 'Pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={[styles.btn, styles.cancelBtn]} 
                        onPress={() => handleDelete(item._id)}
                    >
                        <Ionicons name="trash-outline" size={18} color="white" />
                        <Text style={styles.btnText}>Cancel Request</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>My Orders</Text>
                <View style={{width: 24}} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    title: { fontSize: 20, fontWeight: 'bold' },
    backBtn: { padding: 5 },
    addBtn: { padding: 5 },
    listContainer: { padding: 20 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#666' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    orderId: { fontWeight: 'bold', fontSize: 16 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15 },
    statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    detailsText: { fontSize: 14, color: '#444', marginBottom: 5 },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15 },
    btn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
    cancelBtn: { backgroundColor: '#F44336' },
    btnText: { color: 'white', marginLeft: 5, fontWeight: '600' }
});
