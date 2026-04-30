import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { getBooksAPI } from '../src/api/bookApi';
import { getShopsAPI } from '../src/api/shopApi';
import { BookCard } from '../components/BookCard';

export default function SearchScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((q as string) || '');
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'books' | 'shops'>('all');

  const performSearch = async () => {
    setLoading(true);
    try {
      const [booksRes, shopsRes] = await Promise.all([
        getBooksAPI(),
        getShopsAPI()
      ]);

      const allBooks = booksRes.data;
      const allShops = shopsRes.data;

      const filteredBooks = allBooks.filter((b: any) => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.genre && b.genre.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      const filteredShops = allShops.filter((s: any) => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setBooks(filteredBooks);
      setShops(filteredShops);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [searchQuery]);

  const renderShopItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.shopCard}
      onPress={() => router.push({ pathname: '/shop/[id]', params: { id: item._id } })}
    >
      <View style={styles.shopInfo}>
        <Text style={styles.shopName}>{item.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.averageRating.toFixed(1)} ({item.numReviews})</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books or shops..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={!q}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity 
          style={[styles.tab, filter === 'all' && styles.activeTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.tabText, filter === 'all' && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, filter === 'books' && styles.activeTab]}
          onPress={() => setFilter('books')}
        >
          <Text style={[styles.tabText, filter === 'books' && styles.activeTabText]}>Books ({books.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, filter === 'shops' && styles.activeTab]}
          onPress={() => setFilter('shops')}
        >
          <Text style={[styles.tabText, filter === 'shops' && styles.activeTabText]}>Shops ({shops.length})</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <ScrollView style={styles.resultsContainer}>
          {(filter === 'all' || filter === 'books') && books.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Books</Text>
              <View style={styles.booksGrid}>
                {books.map(book => (
                  <BookCard
                    key={book._id}
                    id={book._id}
                    title={book.title}
                    author={book.author}
                    rating={book.averageRating}
                    image={book.imageUrl}
                    onPress={() => router.push({ pathname: '/book/[id]', params: { id: book._id } })}
                  />
                ))}
              </View>
            </View>
          )}

          {(filter === 'all' || filter === 'shops') && shops.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shops</Text>
              {shops.map(shop => (
                <View key={shop._id}>
                  {renderShopItem({ item: shop })}
                </View>
              ))}
            </View>
          )}

          {books.length === 0 && shops.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={80} color="#EEE" />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySub}>Try searching for something else</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    marginRight: 15,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  filterTabs: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F5F6F8',
  },
  activeTab: {
    backgroundColor: '#333',
  },
  tabText: {
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    color: '#1A1A1A',
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shopCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptySub: {
    fontSize: 16,
    color: '#999',
    marginTop: 5,
  },
});
