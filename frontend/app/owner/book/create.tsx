import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../../src/context/AuthContext';
import { getShopsAPI } from '../../../src/api/shopApi';
import { createBookAPI } from '../../../src/api/bookApi';

export default function CreateBookScreen() {
    const { user } = useContext(AuthContext);
    const router = useRouter();

    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [stockCount, setStockCount] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow photo library access to attach images.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled && result.assets.length > 0) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    useEffect(() => {
        const fetchMyShops = async () => {
            try {
                const res = await getShopsAPI();
                const myShops = res.data.filter(s => s.shopOwner?._id === user?._id);
                setShops(myShops);
                if (myShops.length > 0) setSelectedShop(myShops[0]._id);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMyShops();
    }, []);

    const handleCreate = async () => {
        if (!title || !author || !price || !selectedShop) {
            if (Platform.OS === 'web') window.alert('Title, Author, Price, and Shop are required');
            else Alert.alert('Error', 'Required fields missing');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('author', author);
            formData.append('description', description);
            formData.append('price', String(price));
            formData.append('category', category);
            formData.append('stockCount', String(stockCount || 0));
            formData.append('shop', selectedShop);

            if (selectedImage) {
                if (Platform.OS === 'web') {
                    const res = await fetch(selectedImage);
                    const blob = await res.blob();
                    const ext = blob.type.split('/')[1] || 'jpeg';
                    formData.append('image', blob, `photo.${ext}`);
                } else {
                    const filename = selectedImage.split('/').pop() || 'photo.jpg';
                    const match = /\.([a-zA-Z]+)$/.exec(filename);
                    const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';
                    formData.append('image', { uri: selectedImage, name: filename, type } as any);
                }
            }

            await createBookAPI(formData);
            if (Platform.OS === 'web') {
                window.alert('Book Added!');
                router.back();
            } else {
                Alert.alert('Success', 'Book added!', [{ text: 'OK', onPress: () => router.back() }]);
            }
        } catch (error: any) {
            console.error(error.response?.data || error.message);
            
            let errDetails = "Failed to add book";
            if (error.response?.data?.message) {
                errDetails = error.response.data.message;
            } else if (typeof error.response?.data === 'string' && error.response.data.includes('<html')) {
                // Try to extract the error text from Express HTML page
                const match = error.response.data.match(/<pre>(.*?)<\/pre>/s);
                errDetails = match ? match[1] : `HTML Error ${error.response.status}`;
            } else if (error.message) {
                errDetails = error.message;
            }

            if (Platform.OS === 'web') window.alert("Failed: " + errDetails);
            else Alert.alert('Error', errDetails);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Add New Book</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.form}>
                <Text style={styles.label}>Select Shop</Text>
                <View style={styles.shopSelector}>
                    {shops.map(s => (
                        <TouchableOpacity key={s._id} style={[styles.shopPill, selectedShop === s._id && styles.shopPillActive]} onPress={() => setSelectedShop(s._id)}>
                            <Text style={selectedShop === s._id ? {color: 'white'} : {}}>{s.name}</Text>
                        </TouchableOpacity>
                    ))}
                    {shops.length === 0 && <Text style={{color: 'red'}}>Please register a shop first!</Text>}
                </View>

                <TextInput style={styles.input} placeholder="Book Title" value={title} onChangeText={setTitle} />
                <TextInput style={styles.input} placeholder="Author" value={author} onChangeText={setAuthor} />
                <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />
                <View style={styles.row}>
                    <TextInput style={[styles.input, {flex: 1, marginRight: 10}]} placeholder="Price (Rs)" keyboardType="numeric" value={price} onChangeText={setPrice} />
                    <TextInput style={[styles.input, {flex: 1}]} placeholder="Initial Stock" keyboardType="numeric" value={stockCount} onChangeText={setStockCount} />
                </View>
                <TextInput style={[styles.input, styles.textArea]} placeholder="Description" multiline rows={4} value={description} onChangeText={setDescription} />

                {/* Image Picker */}
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    <Ionicons name="camera-outline" size={20} color="#007bff" />
                    <Text style={styles.imagePickerText}>
                        {selectedImage ? 'Change Photo' : 'Upload Book Cover'}
                    </Text>
                </TouchableOpacity>
                {selectedImage && (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                        <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
                            <Ionicons name="close-circle" size={24} color="#ff4444" />
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity style={styles.btn} onPress={handleCreate}>
                    <Text style={styles.btnText}>Add Book to Inventory</Text>
                </TouchableOpacity>
                <View style={{height: 50}} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
    title: { fontSize: 20, fontWeight: 'bold' },
    backBtn: { padding: 5 },
    form: { padding: 20 },
    label: { fontWeight: 'bold', marginBottom: 10, color: '#444' },
    shopSelector: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 10 },
    shopPill: { padding: 10, borderRadius: 20, backgroundColor: '#eee', borderWidth: 1, borderColor: '#ccc' },
    shopPillActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
    input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    textArea: { height: 100, textAlignVertical: 'top' },
    btn: { backgroundColor: Colors.light.primary, padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    imagePicker: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EBF4FF', borderWidth: 1.5, borderColor: '#007bff', borderStyle: 'dashed', borderRadius: 12, paddingVertical: 15, paddingHorizontal: 16, marginBottom: 15 },
    imagePickerText: { color: '#007bff', fontWeight: '600', fontSize: 15 },
    imagePreviewContainer: { position: 'relative', marginBottom: 15, borderRadius: 12, overflow: 'hidden' },
    imagePreview: { width: '100%', height: 180, borderRadius: 12 },
    removeImageBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'white', borderRadius: 12 }
});
