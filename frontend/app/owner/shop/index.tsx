import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../../src/context/AuthContext';
import { getShopsAPI, deleteShopAPI } from '../../../src/api/shopApi';

export default function MyShopsScreen() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            setLoading(true);
            const res = await getShopsAPI();
            // Filter to only this owner's shops
            const myShops = res.data.filter(s => s.shopOwner?._id === user?._id);
            setShops(myShops);
        } catch (error) {
            if (Platform.OS === 'web') window.alert('Error fetching shops');
            else Alert.alert('Error', 'Could not fetch shops');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const executeDelete = async () => {
            try {
                await deleteShopAPI(id, user.token);
                fetchShops();
                if (Platform.OS === 'web') window.alert("Deleted");
                else Alert.alert("Success", "Shop deleted");
            } catch (error) {
                if (Platform.OS === 'web') window.alert("Failed to delete");
                else Alert.alert("Error", "Could not delete");
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to delete this shop?")) executeDelete();
        } else {
            Alert.alert("Confirm", "Delete this shop?", [{ text: "Cancel" }, { text: "Delete", onPress: executeDelete, style: "destructive" }]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>My Shops</Text>
                <TouchableOpacity onPress={() => router.push('/owner/shop/create')} style={styles.addBtn}>
                    <Ionicons name="add" size={24} color={Colors.light.primary} />
                </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator style={{marginTop: 50}} /> : (
                <FlatList 
                    data={shops}
                    keyExtractor={i => i._id}
                    contentContainerStyle={{ padding: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.shopName}>{item.name}</Text>
                            <Text style={styles.shopDetail}>{item.location}</Text>
                            <Text style={styles.shopDetail}>{item.contactNumber}</Text>
                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.btnDanger} onPress={() => handleDelete(item._id)}>
                                    <Text style={{color: 'white', fontWeight: 'bold'}}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={{textAlign: 'center', color: '#666', marginTop: 30}}>No shops registered.</Text>}
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
    card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2, marginBottom: 15 },
    shopName: { fontSize: 18, fontWeight: 'bold', color: Colors.light.primary, marginBottom: 5 },
    shopDetail: { color: '#666', marginBottom: 3 },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    btnDanger: { backgroundColor: '#e74c3c', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 }
});
