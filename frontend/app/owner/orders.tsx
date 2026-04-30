import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { getShopOrdersAPI, updateOrderStatusAPI, deleteOrderAPI } from '../../src/api/orderApi';
import { AuthContext } from '../../src/context/AuthContext';
import { getShopsAPI } from '../../src/api/shopApi';

export default function ShopOwnerOrdersScreen() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?._id) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const shopsRes = await getShopsAPI();
            const myShops = shopsRes.data.filter((s: any) => s.shopOwner?._id === user?._id);
            
            let allOrders: any[] = [];
            for (const shop of myShops) {
                const ordersRes = await getShopOrdersAPI(shop._id);
                allOrders = [...allOrders, ...ordersRes.data];
            }
            
            // Sort by latest first
            allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            setOrders(allOrders as any);
        } catch (error) {
            Alert.alert("Error", "Could not fetch shop orders");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = (orderId, newStatus) => {
        const performUpdate = async () => {
            try {
                await updateOrderStatusAPI(orderId, newStatus);
                fetchOrders(); // Refresh status
                if (Platform.OS === 'web') {
                    window.alert(`Order moved to ${newStatus}`);
                } else {
                    Alert.alert("Success", `Order moved to ${newStatus}`);
                }
            } catch (err) {
                if (Platform.OS === 'web') {
                    window.alert("Error: Could not update order");
                } else {
                    Alert.alert("Error", "Could not update order");
                }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
                performUpdate();
            }
        } else {
            Alert.alert("Update Status", `Are you sure you want to change status to ${newStatus}?`, [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: performUpdate }
            ]);
        }
    };

    const handleRemoveOrder = (orderId) => {
        const performDelete = async () => {
            try {
                await deleteOrderAPI(orderId);
                fetchOrders(); // Refresh table
                if (Platform.OS === 'web') { window.alert("Order removed & stock refunded"); }
                else { Alert.alert("Success", "Order removed & stock refunded"); }
            } catch (err) {
                if (Platform.OS === 'web') { window.alert("Failed to remove order"); }
                else { Alert.alert("Error", "Failed to remove order"); }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to remove this order from the system?")) {
                performDelete();
            }
        } else {
            Alert.alert("Remove Order", "Are you sure you want to remove this order and refund the stock?", [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: 'destructive', onPress: performDelete }
            ]);
        }
    };

    const renderOrderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Pending' ? '#FFC107' : item.status === 'Cancelled' ? '#F44336' : Colors.light.primary }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            <Text style={styles.detailsText}>Book: {item.book?.title || 'Unknown Book'}</Text>
            <Text style={styles.detailsText}>Customer: {item.reader?.firstName} {item.reader?.lastName} ({item.reader?.email})</Text>
            <Text style={styles.detailsText}>Phone: {item.deliveryDetails?.phone}</Text>
            <Text style={styles.detailsText}>Address: {item.deliveryDetails?.address}, {item.deliveryDetails?.city}</Text>
            <Text style={styles.detailsText}>Quantity: {item.quantity} | Total: Rs. {item.totalPrice}</Text>

            {item.status !== 'Cancelled' && item.status !== 'Delivered' && (
                <View style={styles.actions}>
                    {item.status === 'Pending' && (
                        <>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#F44336', marginRight: 10 }]} onPress={() => handleRemoveOrder(item._id)}>
                            <Text style={styles.btnText}>Remove</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#4CAF50' }]} onPress={() => handleUpdateStatus(item._id, 'Confirmed')}>
                            <Text style={styles.btnText}>Confirm</Text>
                        </TouchableOpacity>
                        </>
                    )}
                    {item.status === 'Confirmed' && (
                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#2196F3' }]} onPress={() => handleUpdateStatus(item._id, 'Shipped')}>
                            <Text style={styles.btnText}>Ship Order</Text>
                        </TouchableOpacity>
                    )}
                    {item.status === 'Shipped' && (
                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#9C27B0' }]} onPress={() => handleUpdateStatus(item._id, 'Delivered')}>
                            <Text style={styles.btnText}>Mark Delivered</Text>
                        </TouchableOpacity>
                    )}
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
                <Text style={styles.title}>Shop Orders Incoming</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>No orders received yet.</Text>}
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
    btnText: { color: 'white', fontWeight: 'bold' }
});
