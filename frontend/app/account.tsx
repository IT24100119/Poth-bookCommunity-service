import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../src/context/AuthContext';
import { updateUserAPI, deleteUserAPI } from '../src/api/userApi';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const { user, logoutContext, updateUserContext } = useContext(AuthContext);
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleLogout = () => {
    const performLogout = async () => {
      await logoutContext();
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Logout: Are you sure you want to log out?")) {
        performLogout();
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: performLogout }
      ]);
    }
  };

  const handleUpdate = async () => {
    if (!user?.token) return;
    try {
        const res = await updateUserAPI({ firstName, lastName, email }, user.token);
        await updateUserContext(res.data);
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
        Alert.alert("Error", "Could not update profile");
    }
  };

  const handleDelete = () => {
      const performDelete = async () => {
          if (!user?.token) return;
          try {
              await deleteUserAPI(user.token);
              await logoutContext();
          } catch (error) {
              Alert.alert("Error", "Could not delete account");
          }
      };

      if (Platform.OS === 'web') {
          if (window.confirm("Delete Account: This action is irreversible. Are you completely sure?")) {
              performDelete();
          }
      } else {
          Alert.alert("Delete Account", "This action is irreversible. Are you completely sure?", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete It", style: "destructive", onPress: performDelete }
          ]);
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View style={styles.header}>
                <Text style={styles.title}>Account</Text>
                {isEditing && (
                    <TouchableOpacity onPress={handleUpdate}>
                        <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.content}>
                <View style={styles.profileSection}>
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {user ? user.firstName.charAt(0) + user.lastName.charAt(0) : '?'}
                    </Text>
                  </View>
                  {!isEditing ? (
                      <>
                        <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                      </>
                  ) : (
                      <View style={styles.editForm}>
                          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First Name" />
                          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last Name" />
                          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
                      </View>
                  )}
                </View>

                <View style={styles.menu}>
                  <TouchableOpacity style={styles.menuItem} onPress={() => setIsEditing(!isEditing)}>
                    <Ionicons name="settings-outline" size={24} color="#333" />
                    <Text style={styles.menuText}>{isEditing ? "Cancel Edit" : "Edit Profile"}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
                    <Ionicons name="cart-outline" size={24} color="#333" />
                    <Text style={styles.menuText}>My Orders</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={24} color="#F44336" />
                    <Text style={[styles.menuText, { color: '#F44336' }]}>Delete Account</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#F44336" />
                    <Text style={[styles.menuText, { color: '#F44336' }]}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </View>
          </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  saveText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  editForm: {
      width: '100%',
      marginTop: 20
  },
  input: {
      backgroundColor: '#f5f5f5',
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      width: '100%',
      fontSize: 16
  },
  menu: {
    backgroundColor: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 15,
  },
});
