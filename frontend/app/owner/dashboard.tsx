import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Dimensions, Alert, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { AuthContext } from '../../src/context/AuthContext';

const { width } = Dimensions.get('window');

const STATS = [
  { label: 'TOTAL SHOPS', value: '08', change: '2 new this month', color: '#003D71' },
  { label: 'ACTIVE ALERTS', value: '03', change: 'Requires your attention', color: '#E74C3C' },
  { label: 'LOW STOCK ITEMS', value: '14', progress: 0.7, color: '#F1C40F' },
];

const MY_SHOPS = [
  { id: '1', name: 'The Reading Nook', location: 'High Street, London', status: 'OPEN', image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1000&auto=format&fit=crop' },
  { id: '2', name: 'Ink & Parchment', location: 'Old Town Square', status: 'EVENT', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop' },
];

const ACTIVITY = [
  { id: '1', shop: 'The Midnight Library', action: 'Added 24 copies to "Reading Nook"', time: '2 HOURS AGO' },
  { id: '2', shop: 'Great Expectations', action: 'Stock replenished at "Ink & Parchment"', time: '5 HOURS AGO' },
  { id: '3', shop: 'Wild Botany', action: 'New arrival - 10 First Editions', time: 'YESTERDAY' },
];

export default function OwnerDashboard() {
  const router = useRouter();
  const { logoutContext } = useContext(AuthContext);

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
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
             <Ionicons name="book-outline" size={24} color={Colors.light.primary} />
             <Text style={styles.headerTitle}>The Curator's Desk</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push('/account')}>
                <Image 
                    source={{ uri: 'https://i.pravatar.cc/150?u=owner' }} 
                    style={styles.avatar} 
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Ionicons name="log-out-outline" size={28} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Carousel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsContent}>
          {STATS.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              {stat.change && (
                <View style={styles.changeBadge}>
                   <Ionicons name="trending-up" size={12} color={stat.color} />
                   <Text style={[styles.changeText, { color: stat.color }]}>{stat.change}</Text>
                </View>
              )}
              {stat.progress !== undefined && (
                <View style={styles.progressBarWrapper}>
                   <View style={[styles.progressBar, { width: `${stat.progress * 100}%`, backgroundColor: '#8B4513' }]} />
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}><Ionicons name="flash" size={20} /> Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/owner/shop/create')}>
              <Ionicons name="business" size={20} color="white" />
              <Text style={styles.actionText}>Register New Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]} onPress={() => router.push('/owner/orders')}>
              <Ionicons name="cart" size={20} color="#003D71" />
              <Text style={[styles.actionText, styles.actionTextSecondary]}>Shop Orders</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.actionsRow, { marginTop: 10 }]}>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]} onPress={() => router.push('/owner/book')}>
              <Ionicons name="sync" size={20} color="#003D71" />
              <Text style={[styles.actionText, styles.actionTextSecondary]}>Update Stock (Books)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Shops */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Shops</Text>
            <TouchableOpacity onPress={() => router.push('/owner/shop')}><Text style={styles.viewLink}>Manage My Shops</Text></TouchableOpacity>
          </View>
          {MY_SHOPS.map(shop => (
            <TouchableOpacity key={shop.id} style={styles.shopCard}>
              <Image source={{ uri: shop.image }} style={styles.shopImage} />
              <View style={styles.shopInfo}>
                <View>
                  <Text style={styles.shopName}>{shop.name}</Text>
                  <Text style={styles.shopLoc}>{shop.location}</Text>
                </View>
                <View style={styles.statusBadge}>
                   <Text style={styles.statusText}>STATUS: {shop.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={[styles.section, styles.activityWrapper]}>
          <Text style={styles.sectionTitle}><Ionicons name="stats-chart" size={20} /> Recent Stock Activity</Text>
          {ACTIVITY.map(act => (
            <View key={act.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                 <Ionicons name="book" size={24} color="#333" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityShop}>{act.shop}</Text>
                <Text style={styles.activityAction}>{act.action}</Text>
                <Text style={styles.activityTime}>{act.time}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.showAllActivity}>
            <Text style={styles.showAllText}>Show All Activity</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  container: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003D71',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  logoutBtn: {
    padding: 5,
  },
  statsScroll: {
    marginBottom: 25,
  },
  statsContent: {
    paddingLeft: 25,
    paddingRight: 10,
  },
  statCard: {
    width: width * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#BBB',
    letterSpacing: 1,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#003D71',
    marginBottom: 8,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 5,
  },
  changeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarWrapper: {
    height: 4,
    backgroundColor: '#EEE',
    borderRadius: 2,
    marginTop: 20,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  section: {
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003D71',
    marginBottom: 15,
  },
  viewLink: {
    fontSize: 14,
    color: '#003D71',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#003D71',
    height: 56,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#E8EDF2',
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionTextSecondary: {
    color: '#003D71',
  },
  shopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  shopImage: {
    height: 120,
    width: '100%',
  },
  shopInfo: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#BDC3C7',
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003D71',
  },
  shopLoc: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  activityWrapper: {
    backgroundColor: '#F3F4F9',
    marginHorizontal: 15,
    borderRadius: 24,
    padding: 20,
    paddingTop: 25,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15,
  },
  activityIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
  },
  activityContent: {
    flex: 1,
  },
  activityShop: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activityAction: {
    fontSize: 12,
    color: '#666',
    marginVertical: 4,
  },
  activityTime: {
    fontSize: 10,
    color: '#BBB',
    fontWeight: '600',
  },
  showAllActivity: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },
  showAllText: {
    color: '#003D71',
    fontWeight: 'bold',
  },
});
