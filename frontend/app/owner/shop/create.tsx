import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../../src/context/AuthContext';
import { createShopAPI } from '../../../src/api/shopApi';

export default function CreateShopScreen() {
    const { user } = useContext(AuthContext);
    const router = useRouter();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [contactNumber, setContactNumber] = useState('');

    const handleCreate = async () => {
        if (!name || !description || !location || !contactNumber) {
            if (Platform.OS === 'web') window.alert('Please fill all fields');
            else Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            await createShopAPI({ name, description, location, contactNumber }, user.token);
            if (Platform.OS === 'web') {
                window.alert('Shop Created Successfully!');
                router.back();
            } else {
                Alert.alert('Success', 'Shop Created Successfully!', [{ text: 'OK', onPress: () => router.back() }]);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to create shop';
            if (Platform.OS === 'web') window.alert(`Error: ${errorMsg}`);
            else Alert.alert('Error', errorMsg);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Register New Shop</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.form}>
                <TextInput style={styles.input} placeholder="Shop Name" value={name} onChangeText={setName} />
                <TextInput style={[styles.input, styles.textArea]} placeholder="Description" multiline rows={4} value={description} onChangeText={setDescription} />
                <TextInput style={styles.input} placeholder="Location (Address/City)" value={location} onChangeText={setLocation} />
                <TextInput style={styles.input} placeholder="Contact Number" keyboardType="phone-pad" value={contactNumber} onChangeText={setContactNumber} />

                <TouchableOpacity style={styles.btn} onPress={handleCreate}>
                    <Text style={styles.btnText}>Create Shop</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
    title: { fontSize: 20, fontWeight: 'bold' },
    backBtn: { padding: 5 },
    form: { padding: 20 },
    input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
    textArea: { height: 100, textAlignVertical: 'top' },
    btn: { backgroundColor: Colors.light.primary, padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});
