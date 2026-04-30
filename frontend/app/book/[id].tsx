import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/theme';
import { AuthContext } from '../../src/context/AuthContext';
import { getBookByIdAPI } from '../../src/api/bookApi';
import { getReviewsAPI, addReviewAPI } from '../../src/api/reviewApi';
import { Button } from '../../components/Button';

const { height } = Dimensions.get('window');

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('Overview');
  const [book, setBook] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
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
    const fetchData = async () => {
      try {
        const bookRes = await getBookByIdAPI(id);
        setBook(bookRes.data);
        const reviewsRes = await getReviewsAPI(id);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error("Failed to load book or reviews", error);
        Alert.alert("Error", "Could not load book details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmitReview = async () => {
      if (!user?.token) {
          Alert.alert("Authentication Required", "Please login to leave a review.");
          return;
      }
      if (!comment.trim()) {
          Alert.alert("Error", "Please write a comment.");
          return;
      }
      setSubmittingReview(true);
      try {
          const formData = new FormData();
          formData.append('targetId', id as string);
          formData.append('targetModel', 'Book');
          formData.append('rating', String(rating));
          formData.append('comment', comment);
          if (selectedImage) {
              if (Platform.OS === 'web') {
                  const res = await fetch(selectedImage);
                  const blob = await res.blob();
                  formData.append('image', blob, 'photo.jpg');
              } else {
                  const filename = selectedImage.split('/').pop() || 'photo.jpg';
                  const match = /\.([a-zA-Z]+)$/.exec(filename);
                  const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';
                  formData.append('image', { uri: selectedImage, name: filename, type } as any);
              }
          }
          await addReviewAPI(formData, user.token);
          const reviewsRes = await getReviewsAPI(id);
          setReviews(reviewsRes.data);
          setComment('');
          setSelectedImage(null);
          Alert.alert("Success", "Review submitted!");
      } catch (error: any) {
          Alert.alert("Error", error.response?.data?.message || "Failed to submit review");
      } finally {
          setSubmittingReview(false);
      }
  };

  if (loading) {
      return (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center'}]}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
      );
  }

  if (!book) return <View style={styles.container}><Text>Book not found</Text></View>;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Top Image & Overlay */}
      <ImageBackground source={{ uri: book.imageUrl }} style={styles.topImage}>
        <SafeAreaView>
          <View style={styles.topNav}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bookmarkButton}>
              <Ionicons name="bookmark-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.glassContainer}>
          <BlurView intensity={30} style={styles.glassBlur} tint="dark">
             <View style={styles.bookInfoRow}>
                <View style={styles.mainInfo}>
                   <Text style={styles.title}>{book.title}</Text>
                   <View style={styles.authorRow}>
                      <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.authorText}>{book.author}</Text>
                   </View>
                </View>
                <View style={styles.priceContainer}>
                   <Text style={styles.priceLabel}>Price</Text>
                   <Text style={styles.priceValue}>Rs.{book.price}</Text>
                </View>
             </View>
          </BlurView>
        </View>
      </ImageBackground>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.tabsRow}>
          <TouchableOpacity onPress={() => setActiveTab('Overview')}>
            <Text style={[styles.tabText, activeTab === 'Overview' && styles.tabTextActive]}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Reviews')}>
            <Text style={[styles.tabText, activeTab === 'Reviews' && styles.tabTextActive]}>Reviews ({reviews.length})</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'Overview' && (
            <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.metaRow}>
                <View style={styles.statusBadge}>
                    <Ionicons name="time-outline" size={18} color="#666" />
                    <Text style={styles.statusText}>{book.stockCount > 0 ? `${book.stockCount} in stock` : 'Out of stock'}</Text>
                </View>
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={18} color="#FFC107" />
                    <Text style={styles.ratingText}>{book.averageRating?.toFixed(1) || 0}</Text>
                </View>
            </View>
            <Text style={styles.description}>
                {book.description}
            </Text>
            {book.shop && (
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Available at</Text>
                    <Text style={{ fontSize: 16, color: '#333' }}>{book.shop.name} ({book.shop.location})</Text>
                </View>
            )}
            <View style={{ height: 100 }} />
            </ScrollView>
        )}

        {activeTab === 'Reviews' && (
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Submit Review Form */}
                <View style={styles.reviewForm}>
                    <Text style={styles.reviewFormTitle}>Leave a Review</Text>
                    <View style={styles.starSelection}>
                        {[1,2,3,4,5].map(star => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Ionicons name={star <= rating ? "star" : "star-outline"} size={30} color="#FFC107" />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TextInput 
                        style={styles.reviewInput} 
                        placeholder="Write your thoughts..." 
                        multiline 
                        numberOfLines={3} 
                        value={comment}
                        onChangeText={setComment}
                    />
                    {/* Image Picker */}
                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        <Ionicons name="camera-outline" size={20} color="#007bff" />
                        <Text style={styles.imagePickerText}>
                            {selectedImage ? 'Change Photo' : 'Add Photo'}
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
                    <Button title={submittingReview ? "Submitting..." : "Submit Review"} onPress={handleSubmitReview} disabled={submittingReview} />
                </View>

                {/* Review List */}
                <View style={{ marginTop: 30, paddingBottom: 100 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Community Reviews</Text>
                    {reviews.length === 0 ? (
                        <Text style={{ color: '#999' }}>No reviews yet. Be the first!</Text>
                    ) : (
                        reviews.map(review => (
                            <View key={review._id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.reviewAvatar}>
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{review.user?.firstName?.charAt(0) || 'U'}</Text>
                                    </View>
                                    <View style={{ marginLeft: 10 }}>
                                        <Text style={{ fontWeight: 'bold' }}>{review.user?.firstName || 'Unknown'} {review.user?.lastName || ''}</Text>
                                        <View style={{ flexDirection: 'row' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Ionicons key={i} name={i < review.rating ? "star" : "star-outline"} size={12} color="#FFC107" />
                                            ))}
                                        </View>
                                    </View>
                                    <Text style={{ marginLeft: 'auto', color: '#999', fontSize: 12 }}>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text style={{ marginTop: 10, color: '#333', lineHeight: 22 }}>{review.comment}</Text>
                                {review.imageUrl && (
                                    <Image
                                        source={{ uri: review.imageUrl }}
                                        style={styles.reviewImage}
                                        resizeMode="cover"
                                    />
                                )}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        )}
      </View>

      {/* Floating Button */}
      {activeTab === 'Overview' && (
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.bookNowButton}
          onPress={() => router.push({ pathname: '/orders/create', params: { bookId: book._id, shopId: book.shop?._id || book.shop } })}
        >
          <Text style={styles.bookNowText}>Reserve Book</Text>
          <Ionicons name="paper-plane-outline" size={20} color="white" style={styles.bookNowIcon} />
        </TouchableOpacity>
      </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topImage: {
    height: height * 0.45,
    width: '100%',
    justifyContent: 'space-between',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassContainer: {
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 30,
  },
  glassBlur: {
    padding: 24,
  },
  bookInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainInfo: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 6,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FFFFFF',
    marginTop: -30,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 20,
  },
  tabText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#CCCCCC',
  },
  tabTextActive: {
    color: '#1A1A1A',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  ratingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  description: {
    fontSize: 18,
    lineHeight: 28,
    color: '#999',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 25,
    right: 25,
  },
  bookNowButton: {
    backgroundColor: '#1A1A1A',
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookNowIcon: {
    marginLeft: 10,
    transform: [{ rotate: '45deg' }],
  },
  reviewForm: {
      backgroundColor: '#f9f9f9',
      padding: 20,
      borderRadius: 16,
      marginTop: 10
  },
  reviewFormTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10
  },
  starSelection: {
      flexDirection: 'row',
      marginBottom: 15,
      gap: 5
  },
  reviewInput: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 12,
      padding: 15,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: 15,
      fontSize: 16
  },
  reviewCard: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#F0F0F0',
      padding: 20,
      borderRadius: 16,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2
  },
  reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center'
  },
  reviewAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.light.primary,
      justifyContent: 'center',
      alignItems: 'center'
  },
  imagePicker: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#EBF4FF',
      borderWidth: 1.5,
      borderColor: '#007bff',
      borderStyle: 'dashed',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 12,
  },
  imagePickerText: {
      color: '#007bff',
      fontWeight: '600',
      fontSize: 15,
  },
  imagePreviewContainer: {
      position: 'relative',
      marginBottom: 12,
      borderRadius: 12,
      overflow: 'hidden',
  },
  imagePreview: {
      width: '100%',
      height: 180,
      borderRadius: 12,
  },
  removeImageBtn: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'white',
      borderRadius: 12,
  },
  reviewImage: {
      width: '100%',
      height: 180,
      borderRadius: 10,
      marginTop: 12,
  },
});
