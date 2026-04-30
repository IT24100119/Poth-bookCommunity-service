import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../../src/context/AuthContext';
import { getShopsAPI } from '../../../src/api/shopApi';
import { getBooksByShopAPI, deleteBookAPI } from '../../../src/api/bookApi';

export default function InventoryScreen() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllOwnerBooks();
    }, []);

    const fetchAllOwnerBooks = async () => {
        try {
            setLoading(true);
            const shopsRes = await getShopsAPI();
            const myShops = shopsRes.data.filter(s => s.shopOwner?._id === user?._id);
            
            let allBooks = [];
            for (let shop of myShops) {
                 // Ignore if shop ID is invalid or failed.
                 try {
                    const bRes = await getBooksByShopAPI(shop._id);
                    const booksWithShop = bRes.data.map(b => ({ ...b, shopName: shop.name }));
                    allBooks = [...allBooks, ...booksWithShop];
                 } catch (err) {}
            }
            setBooks(allBooks);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const executeDelete = async () => {
            try {
                await deleteBookAPI(id);
                fetchAllOwnerBooks();
                if (Platform.OS === 'web') window.alert("Deleted");
            } catch (error) {
                if (Platform.OS === 'web') window.alert("Failed to delete");
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to delete this book?")) executeDelete();
        } else {
            Alert.alert("Confirm", "Delete this book?", [{ text: "Cancel" }, { text: "Delete", onPress: executeDelete, style: "destructive" }]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Book Inventory</Text>
                <TouchableOpacity onPress={() => router.push('/owner/book/create')} style={styles.addBtn}>
                    <Ionicons name="add" size={24} color={Colors.light.primary} />
                </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator style={{marginTop: 50}} /> : (
                <FlatList 
                    data={books}
                    keyExtractor={i => i._id}
                    contentContainerStyle={{ padding: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.bookTitle}>{item.title}</Text>
                            <Text style={styles.detail}>Shop: {item.shopName}</Text>
                            <Text style={styles.detail}>Price: Rs. {item.price}</Text>
                            <Text style={[styles.detail, {fontWeight:'bold', color: item.stockCount > 0 ? 'green' : 'red'}]}>
                                Stock: {item.stockCount}
                            </Text>
                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.btnDanger} onPress={() => handleDelete(item._id)}>
                                    <Text style={{color: 'white', fontWeight: 'bold'}}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={{textAlign: 'center', color: '#666', marginTop: 30}}>No books in inventory.</Text>}
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
    bookTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.light.primary, marginBottom: 5 },
    detail: { color: '#666', marginBottom: 3 },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    btnDanger: { backgroundColor: '#e74c3c', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 }
});
