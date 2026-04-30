import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '../../constants/theme';
import { BookCard } from '../../components/BookCard';
import { AuthContext } from '../../src/context/AuthContext';
import { getBooksAPI } from '../../src/api/bookApi';

const { width } = Dimensions.get('window');
const CATEGORIES = ['All Stocks', 'Nearly coming', 'Out of stock'];

export default function CustomerDashboard() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [activeCategory, setActiveCategory] = useState(0);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({ pathname: '/search', params: { q: searchQuery } });
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
        try {
            const res = await getBooksAPI();
            setBooks(res.data);
        } catch (error) {
            console.error("Failed to load books", error);
        } finally {
            setLoading(false);
        }
    };
    fetchBooks();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {user?.firstName || 'Reader'} 👋</Text>
            <Text style={styles.subGreeting}>Explore the habit of reading</Text>
          </View>
          <Image 
            source={{ uri: `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random` }} 
            style={styles.avatar} 
          />
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <TextInput 
              placeholder="Search books/shops" 
              style={styles.searchInput}
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <View style={styles.verticalDivider} />
            <TouchableOpacity style={styles.filterButton} onPress={handleSearch}>
              <Ionicons name="search-outline" size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Discovery Buttons */}
        <View style={styles.discoveryRow}>
          <TouchableOpacity 
            style={[styles.discoveryCard, { backgroundColor: '#E3F2FD' }]}
            onPress={() => router.push('/discover/books')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="book" size={24} color="#1976D2" />
            </View>
            <Text style={styles.discoveryTitle}>Discover books</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.discoveryCard, { backgroundColor: '#F3E5F5' }]}
            onPress={() => router.push('/discover/shops')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="storefront" size={24} color="#7B1FA2" />
            </View>
            <Text style={styles.discoveryTitle}>Discover Shops</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Your alerted books</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity 
              key={cat} 
              style={[
                styles.categoryChip, 
                activeCategory === index && styles.categoryChipActive
              ]}
              onPress={() => setActiveCategory(index)}
            >
              <Text style={[
                styles.categoryText, 
                activeCategory === index && styles.categoryTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Books Grid */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Available Books</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.booksGrid}>
          {loading ? (
             <ActivityIndicator size="large" color={Colors.light.primary} style={{ margin: 20 }} />
          ) : (
             books.filter(book => {
                 if (activeCategory === 1) return book.stockCount > 0 && book.stockCount <= 5;
                 if (activeCategory === 2) return book.stockCount === 0;
                 return true;
             }).map(book => (
               <BookCard 
                 key={book._id}
                 id={book._id}
                 title={book.title}
                 author={book.author}
                 rating={book.averageRating}
                 image={book.imageUrl}
                 onPress={() => router.push({ pathname: '/book/[id]', params: { id: book._id } })}
               />
             ))
          )}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#EEEEEE',
  },
  searchSection: {
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 64,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 15,
  },
  filterButton: {
    padding: 5,
  },
  discoveryRow: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  discoveryCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  discoveryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  categorySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  viewAll: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryScroll: {
    paddingLeft: 25,
    marginBottom: 30,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F7F7F7',
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#2D3436',
  },
  categoryText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  booksGrid: {
    paddingLeft: 25,
    paddingRight: 5,
  },
});
