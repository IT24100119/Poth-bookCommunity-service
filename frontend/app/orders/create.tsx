import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../src/context/AuthContext';
import { createOrderAPI } from '../../src/api/orderApi';
import { getBookByIdAPI } from '../../src/api/bookApi';
import { useLocalSearchParams } from 'expo-router';

export default function CreateOrderScreen() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const [bookId, setBookId] = useState(params.bookId || "64a2b9f0d11c7b8c8d839222");
    const [shopId, setShopId] = useState(params.shopId || "64a2b9f0d11c7b8c8d839211");
    const [bookDetails, setBookDetails] = useState(null);

    const [quantity, setQuantity] = useState('1');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');

    React.useEffect(() => {
        const fetchBook = async () => {
            try {
                if (bookId) {
                    const res = await getBookByIdAPI(bookId);
                    setBookDetails(res.data);
                }
            } catch (err) {}
        };
        fetchBook();
    }, [bookId]);

    const handleCreateOrder = async () => {
        if (!address || !city || !phone) {
            if (Platform.OS === 'web') { window.alert("Please fill all delivery details"); }
            else { Alert.alert("Error", "Please fill all delivery details"); }
            return;
        }

        const pricePerItem = bookDetails ? bookDetails.price : 2000;
        const orderData = {
            reader: user?._id,
            shop: shopId,
            book: bookId,
            quantity: Number(quantity),
            totalPrice: Number(quantity) * pricePerItem,
            deliveryDetails: { address, city, phone }
        };

        try {
            await createOrderAPI(orderData);
            if (Platform.OS === 'web') {
                window.alert("Test Order Created Successfully!");
                router.replace('/orders');
            } else {
                Alert.alert("Success", "Test Order Created Successfully!", [
                    { text: "OK", onPress: () => router.replace('/orders') }
                ]);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to create order";
            if (Platform.OS === 'web') { window.alert(`Error: ${errorMsg}`); }
            else { Alert.alert("Error", errorMsg); }
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Create Test Order</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.mockInfoCard}>
                    <Text style={styles.mockTitle}>Checkout Details:</Text>
                    <Text style={styles.mockItem}>Book: {bookDetails ? bookDetails.title : "Loading..."} (Rs. {bookDetails ? bookDetails.price : 2000})</Text>
                </View>

                <Text style={styles.label}>Quantity</Text>
                <View style={styles.qtyContainer}>
                    <TouchableOpacity 
                        style={styles.qtyBtn} 
                        onPress={() => setQuantity(String(Math.max(1, Number(quantity) - 1)))}>
                        <Ionicons name="remove" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <TouchableOpacity 
                        style={styles.qtyBtn} 
                        onPress={() => setQuantity(String(Number(quantity) + 1))}>
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.headerTitle}>Delivery Details</Text>
                
                <TextInput 
                    style={styles.input} 
                    placeholder="Address" 
                    value={address} 
                    onChangeText={setAddress} 
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="City" 
                    value={city} 
                    onChangeText={setCity} 
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Phone Number" 
                    value={phone} 
                    keyboardType="phone-pad"
                    onChangeText={setPhone} 
                />

                <TouchableOpacity style={styles.submitBtn} onPress={handleCreateOrder}>
                    <Text style={styles.submitBtnText}>Place Order (Rs. {Number(quantity) * (bookDetails ? bookDetails.price : 2000)})</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
    title: { fontSize: 20, fontWeight: 'bold' },
    backBtn: { padding: 5 },
    content: { padding: 20 },
    mockInfoCard: { backgroundColor: '#f0f8ff', padding: 15, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#b0d4ff' },
    mockTitle: { fontWeight: 'bold', marginBottom: 5, color: '#0056b3' },
    mockItem: { color: '#333', fontSize: 14 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    qtyContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    qtyBtn: { backgroundColor: Colors.light.primary, padding: 10, borderRadius: 8 },
    qtyText: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 20 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
    submitBtn: { backgroundColor: Colors.light.primary, padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
