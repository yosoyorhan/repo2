import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Calendar, Globe, Twitter, Instagram, Users, Video, Edit, UserPlus, UserMinus, Loader2, Share2, Camera, BadgeCheck, PlusCircle, Package, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import ProductPopup from '@/components/ProductPopup';

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [streams, setStreams] = useState([]);
  const [activeStreams, setActiveStreams] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [products, setProducts] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [collections, setCollections] = useState([]);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [soldItems, setSoldItems] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState([]);

  const isOwnProfile = user && profile && user.id === profile.id;

  useEffect(() => {
    fetchProfile();
    fetchStreams();
    fetchActiveStreams();
    fetchProducts();
    fetchCollections();
    fetchSoldItems();
    fetchPurchasedItems();
    if (user && userId) {
      checkFollowStatus();
    }

    // Realtime subscription for sales updates
    const salesChannel = supabase
      .channel(`sales:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sales',
        filter: `seller_id=eq.${userId}`
      }, () => {
        fetchSoldItems();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sales',
        filter: `buyer_id=eq.${userId}`
      }, () => {
        fetchPurchasedItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(salesChannel);
    };
  }, [userId, user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // 406 durumunda .maybeSingle zaten error döndürmez; yine de genel hata için toast göster.
      toast({ title: 'Profil yüklenemedi', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStreams = async () => {
    try {
      const { data, error } = await supabase
        .from('streams')
        .select('id, title, status, created_at, orientation')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setStreams(data || []);
    } catch (error) {
      console.error('Error fetching streams:', error);
    }
  };

  const fetchActiveStreams = async () => {
    try {
      const { data, error } = await supabase
        .from('streams')
        .select('id, title, status, created_at, orientation')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActiveStreams(data || []);
    } catch (error) {
      console.error('Error fetching active streams:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || user.id === userId) return;
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // No follow relationship exists
      setIsFollowing(false);
    }
  };

  const handleEndStream = async (streamId) => {
    try {
      const { error } = await supabase
        .from('streams')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', streamId)
        .eq('user_id', user.id); // Security: only owner can end

      if (error) throw error;

      toast({ title: 'Yayın sonlandırıldı ✅' });
      fetchActiveStreams(); // Refresh list
    } catch (error) {
      console.error('Error ending stream:', error);
      toast({ title: 'Yayın sonlandırılamadı', variant: 'destructive' });
    }
  };

  const fetchSoldItems = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          products(*)
        `)
        .eq('seller_id', userId);
      
      if (error) throw error;
      
      // Manually fetch buyer profiles
      if (data && data.length > 0) {
        const buyerIds = [...new Set(data.map(s => s.buyer_id))];
        const { data: buyers } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', buyerIds);
        
        const buyerMap = {};
        buyers?.forEach(b => { buyerMap[b.id] = b; });
        
        const enrichedData = data.map(sale => ({
          ...sale,
          buyer: buyerMap[sale.buyer_id] || { username: 'Kullanıcı' }
        }));
        
        setSoldItems(enrichedData);
      } else {
        setSoldItems([]);
      }
    } catch (error) {
      console.error('Error fetching sold items:', error);
    }
  };

  const fetchPurchasedItems = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          products(*)
        `)
        .eq('buyer_id', userId);
      
      if (error) throw error;
      
      // Manually fetch seller profiles
      if (data && data.length > 0) {
        const sellerIds = [...new Set(data.map(s => s.seller_id))];
        const { data: sellers } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', sellerIds);
        
        const sellerMap = {};
        sellers?.forEach(s => { sellerMap[s.id] = s; });
        
        const enrichedData = data.map(sale => ({
          ...sale,
          seller: sellerMap[sale.seller_id] || { username: 'Kullanıcı' }
        }));
        
        setPurchasedItems(enrichedData);
      } else {
        setPurchasedItems([]);
      }
    } catch (error) {
      console.error('Error fetching purchased items:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast({ title: 'Giriş yapmalısınız', variant: 'destructive' });
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;
        setIsFollowing(false);
        toast({ title: 'Takibi bıraktınız' });
        
        // Update local counts
        setProfile(prev => ({ ...prev, followers_count: (prev.followers_count || 0) - 1 }));
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: userId });

        if (error) throw error;
        setIsFollowing(true);
        toast({ title: 'Takip ediyorsunuz! 🎉' });
        
        // Update local counts
        setProfile(prev => ({ ...prev, followers_count: (prev.followers_count || 0) + 1 }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({ title: 'Bir hata oluştu', variant: 'destructive' });
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile({ ...profile, ...updates });
      setIsEditing(false);
      toast({ title: 'Profil güncellendi! ✅' });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: 'Güncelleme başarısız', variant: 'destructive' });
    }
  };

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Dosya çok büyük', description: 'Maksimum 5MB', variant: 'destructive' });
      return;
    }

    try {
      setIsUploadingAvatar(true);
      
  const fileExt = file.name.split('.').pop();
  // RLS politikası klasör ismini user.id bekliyor; path içinde ilk segment user id olmalı
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      toast({ title: 'Profil fotoğrafı güncellendi! 📸' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({ title: 'Yükleme başarısız', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Ürünleri çek
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, description, price, image_url, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Callback for when a new product is added
  const handleProductAdded = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  // Koleksiyonları çek
  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          id, name, description, created_at,
          collection_products(product_id, products(*))
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Giriş yapmalısınız', variant: 'destructive' });
      return;
    }
    if (!newCollection.name.trim()) {
      toast({ title: 'Koleksiyon adı gerekli', variant: 'destructive' });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: user.id,
          name: newCollection.name.trim(),
          description: newCollection.description.trim() || null
        })
        .select()
        .single();
      if (error) throw error;
      const newCollectionWithProducts = { ...data, collection_products: [] };
      setCollections(prev => [newCollectionWithProducts, ...prev]);
      setNewCollection({ name: '', description: '' });
      setIsCreatingCollection(false);
      toast({ title: '✅ Koleksiyon oluşturuldu', description: 'Şimdi ürün ekleyebilirsin' });
      
      // Otomatik olarak ürün ekleme modal'ını aç
      setSelectedCollection(newCollectionWithProducts);
      setShowProductSelector(true);
    } catch (error) {
      console.error('Error creating collection:', error);
      toast({ title: 'Koleksiyon oluşturulamadı', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddProductToCollection = async (collectionId, productId) => {
    try {
      const { error } = await supabase
        .from('collection_products')
        .insert({ collection_id: collectionId, product_id: productId });
      if (error) throw error;
      await fetchCollections();
      toast({ title: 'Ürün koleksiyona eklendi ✅' });
    } catch (error) {
      console.error('Error adding product to collection:', error);
      toast({ title: 'Ürün eklenemedi', description: error.message, variant: 'destructive' });
    }
  };

  const handleRemoveProductFromCollection = async (collectionId, productId) => {
    try {
      const { error } = await supabase
        .from('collection_products')
        .delete()
        .eq('collection_id', collectionId)
        .eq('product_id', productId);
      if (error) throw error;
      await fetchCollections();
      toast({ title: 'Ürün koleksiyondan çıkarıldı' });
    } catch (error) {
      console.error('Error removing product from collection:', error);
      toast({ title: 'Ürün çıkarılamadı', variant: 'destructive' });
    }
  };

  const handleShareProfile = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${profile?.username || 'Kullanıcı'} - Profil`,
        text: profile?.bio || 'Profili görüntüle',
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: 'Link kopyalandı! 🔗' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-[#FFDE59]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <User className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-xl text-gray-600">Profil bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-48 sm:h-64"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 sm:-mt-32 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
          >
            {/* Hidden file input for avatar upload */}
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarUpload} 
              className="hidden" 
            />
            
            {/* Avatar and basic info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div 
                  className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-5xl font-bold shadow-lg ${isOwnProfile ? 'cursor-pointer group' : ''}`}
                  onClick={isOwnProfile ? handleAvatarClick : undefined}
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    profile.username?.[0]?.toUpperCase() || 'U'
                  )}
                  {isOwnProfile && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity">
                      {isUploadingAvatar ? (
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      ) : (
                        <Camera className="h-8 w-8 text-white" />
                      )}
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full shadow-lg"
                    onClick={handleEditProfile}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-gray-900">{profile.username || 'Kullanıcı'}</h1>
                    {profile.is_verified && (
                      <BadgeCheck className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <p className="text-gray-500 mt-1">{profile.email}</p>
                  
                  <div className="flex items-center gap-2">
                    {!isOwnProfile && user && (
                      <Button
                        onClick={handleFollow}
                        className={`rounded-full min-h-[44px] ${isFollowing ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="h-5 w-5 mr-2" />
                            Takibi Bırak
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-5 w-5 mr-2" />
                            Takip Et
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShareProfile}
                      className="rounded-full"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{profile.followers_count || 0}</div>
                    <div className="text-sm text-gray-500">Takipçi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{profile.following_count || 0}</div>
                    <div className="text-sm text-gray-500">Takip</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{profile.stream_count || 0}</div>
                    <div className="text-sm text-gray-500">Yayın</div>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-gray-700 mb-4">{profile.bio}</p>
                )}

                {/* Social Links */}
                <div className="flex flex-wrap gap-3">
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
                      <Twitter className="h-4 w-4" />
                      @{profile.twitter}
                    </a>
                  )}
                  {profile.instagram && (
                    <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-pink-600 hover:underline">
                      <Instagram className="h-4 w-4" />
                      @{profile.instagram}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="streams" className="mb-12">
          <TabsList className="bg-white border-b w-full justify-start rounded-none h-auto p-0">
            <TabsTrigger 
              value="streams" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-6 py-3"
            >
              <Video className="h-4 w-4 mr-2" />
              Yayınlar
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-6 py-3"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ürünlerim
            </TabsTrigger>
            <TabsTrigger 
              value="collections" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-6 py-3"
            >
              <Package className="h-4 w-4 mr-2" />
              Koleksiyonlar
            </TabsTrigger>
            <TabsTrigger
              value="purchased"
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-6 py-3"
            >
              <Package className="h-4 w-4 mr-2" />
              Satın Aldıklarım
            </TabsTrigger>
            <TabsTrigger
              value="sold"
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-6 py-3"
            >
              <Package className="h-4 w-4 mr-2" />
              Sattıklarım
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-6 py-3"
            >
              <User className="h-4 w-4 mr-2" />
              Hakkında
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-6 py-3"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Aktivite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="streams" className="mt-6">
            {streams.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Henüz yayın yok</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {streams.map((stream) => (
                  <motion.div
                    key={stream.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="bg-[rgba(255,255,255,0.98)] rounded-[16px] overflow-hidden shadow-[0_4px_12px_rgba(16,24,40,0.06)] hover:shadow-[0_8px_30px_rgba(16,24,40,0.08)] cursor-pointer transition-all duration-200"
                    onClick={() => navigate(`/live/${stream.id}`)}
                  >
                    <div className={`bg-gradient-to-br ${stream.status === 'active' ? 'from-red-500 to-pink-500' : 'from-gray-400 to-gray-600'} aspect-video flex items-center justify-center relative`}>
                      <Video className="h-12 w-12 text-white/80" />
                      {stream.status === 'active' && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          CANLI
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{stream.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(stream.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="bg-white rounded-xl p-6 space-y-6">
              {profile.bio && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Bio</h3>
                  <p className="text-gray-600">{profile.bio}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">İstatistikler</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{profile.followers_count || 0}</div>
                    <div className="text-sm text-gray-600">Takipçi</div>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">{profile.following_count || 0}</div>
                    <div className="text-sm text-gray-600">Takip</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{streams.length}</div>
                    <div className="text-sm text-gray-600">Yayın</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {new Date(profile.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-sm text-gray-600">Üyelik</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            {isOwnProfile && activeStreams.length > 0 && (
              <div className="bg-white rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5 text-red-500" />
                  Aktif Yayınlarınız
                </h3>
                <div className="space-y-3">
                  {activeStreams.map(stream => (
                    <div key={stream.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <div>
                          <p className="font-medium text-gray-900">{stream.title}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(stream.created_at).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleEndStream(stream.id)}
                      >
                        Yayını Sonlandır
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-xl p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aktivite geçmişi yakında eklenecek</p>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <div className="space-y-6">
              {isOwnProfile && (
                <div>
                  <Button onClick={() => setIsAddingProduct(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <PlusCircle className="h-4 w-4 mr-2" /> Ürün Ekle
                  </Button>
                </div>
              )}
              {products.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <PlusCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz ürün yok</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map(prod => (
                    <motion.div
                      key={prod.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="bg-[rgba(255,255,255,0.98)] rounded-[16px] shadow-[0_4px_12px_rgba(16,24,40,0.06)] hover:shadow-[0_8px_30px_rgba(16,24,40,0.08)] overflow-hidden border border-white/40 cursor-pointer transition-all duration-200"
                    >
                      <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl relative">
                        {prod.image_url ? (
                          <img src={prod.image_url} alt={prod.title} className="w-full h-full object-cover" />
                        ) : (
                          prod.title.slice(0,1).toUpperCase()
                        )}
                        {prod.is_sold && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-gray-800/90 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
                              SATILDI ✓
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{prod.title}</h3>
                        {prod.description && <p className="text-sm text-gray-600 line-clamp-3">{prod.description}</p>}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-transparent bg-gradient-to-r from-[#7b3fe4] to-[#e53dd2] bg-clip-text font-bold text-lg">₺{Number(prod.price).toFixed(2)}</span>
                          <span className="text-xs text-gray-500">{new Date(prod.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="collections" className="mt-6">
            <div className="space-y-6">
              {isOwnProfile && (
                <div>
                  {!isCreatingCollection ? (
                    <Button onClick={() => setIsCreatingCollection(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Package className="h-4 w-4 mr-2" /> Koleksiyon Oluştur
                    </Button>
                  ) : (
                    <form onSubmit={handleCreateCollection} className="space-y-4 bg-[rgba(255,255,255,0.65)] backdrop-blur-xl p-6 rounded-[24px] border border-white/40 shadow-lg transition-all duration-300">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Koleksiyon Adı</label>
                        <input
                          type="text"
                          className="input mt-1 w-full rounded-[14px] border border-[rgba(16,24,40,0.06)] bg-[rgba(255,255,255,0.9)] px-4 py-3 shadow-inner focus:border-[#7b3fe4] focus:shadow-[0_6px_20px_rgba(123,63,228,0.06)] transition-all duration-200 placeholder:text-gray-400 focus:placeholder:opacity-0 focus:outline-none"
                          value={newCollection.name}
                          onChange={e => setNewCollection(p => ({ ...p, name: e.target.value }))}
                          placeholder="Örn: Yaz Koleksiyonu"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Açıklama</label>
                        <textarea
                          className="input mt-1 w-full rounded-[14px] border border-[rgba(16,24,40,0.06)] bg-[rgba(255,255,255,0.9)] px-4 py-3 shadow-inner focus:border-[#7b3fe4] focus:shadow-[0_6px_20px_rgba(123,63,228,0.06)] transition-all duration-200 placeholder:text-gray-400 focus:placeholder:opacity-0 focus:outline-none"
                          rows={3}
                          value={newCollection.description}
                          onChange={e => setNewCollection(p => ({ ...p, description: e.target.value }))}
                          placeholder="Koleksiyon açıklaması"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setIsCreatingCollection(false)} className="rounded-full bg-white/20 border border-white/40 hover:bg-gray-100 backdrop-blur-lg transition-all min-h-[44px]">İptal</Button>
                        <Button type="submit" className="rounded-full bg-gradient-to-r from-[#7b3fe4] to-[#e53dd2] text-white shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 focus:shadow-[0_0_10px_rgba(123,63,228,0.5)] transition-all min-h-[44px]">Oluştur</Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
              {collections.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz koleksiyon yok</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {collections.map(collection => (
                    <motion.div
                      key={collection.id}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className="bg-[rgba(255,255,255,0.98)] rounded-[16px] shadow-[0_4px_12px_rgba(16,24,40,0.06)] hover:shadow-[0_8px_30px_rgba(16,24,40,0.08)] border border-white/40 overflow-hidden transition-all duration-200"
                    >
                      <div className="bg-gradient-to-r from-[#7b3fe4] to-[#e53dd2] p-4 text-white">
                        <h3 className="font-bold text-lg">{collection.name}</h3>
                        {collection.description && <p className="text-sm text-white/80 mt-1">{collection.description}</p>}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>{collection.collection_products?.length || 0} ürün</span>
                          <span>{new Date(collection.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        {isOwnProfile && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mb-3 w-full"
                            onClick={() => {
                              setSelectedCollection(collection);
                              setShowProductSelector(true);
                            }}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Ürün Ekle
                          </Button>
                        )}
                        {collection.collection_products?.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">Henüz ürün eklenmemiş</p>
                        ) : (
                          <div className="space-y-2">
                            {collection.collection_products?.map(cp => cp.products && (
                              <div key={cp.product_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{cp.products.title}</p>
                                  <p className="text-purple-600 font-semibold text-sm">₺{Number(cp.products.price).toFixed(2)}</p>
                                </div>
                                {isOwnProfile && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="ml-2"
                                    onClick={() => handleRemoveProductFromCollection(collection.id, cp.product_id)}
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="purchased" className="mt-6">
            {purchasedItems.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-gray-500">Henüz satın alım yok</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {purchasedItems.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow p-4">
                    {item.products?.image_url && (
                      <img src={item.products.image_url} alt={item.products?.title} className="w-full h-32 object-cover rounded mb-2" />
                    )}
                    <h3 className="font-bold">{item.products?.title}</h3>
                    <p className="text-green-600 font-semibold">₺{Number(item.final_price).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Satıcı: {item.seller?.username || 'Kullanıcı'}</p>
                    <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('tr-TR')}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sold" className="mt-6">
            {soldItems.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-gray-500">Henüz satış yok</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {soldItems.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow p-4">
                    {item.products?.image_url && (
                      <img src={item.products.image_url} alt={item.products?.title} className="w-full h-32 object-cover rounded mb-2" />
                    )}
                    <h3 className="font-bold">{item.products?.title}</h3>
                    <p className="text-green-600 font-semibold">₺{Number(item.final_price).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Alıcı: {item.buyer?.username || 'Kullanıcı'}</p>
                    <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('tr-TR')}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Selector Dialog */}
      <Dialog open={showProductSelector} onOpenChange={setShowProductSelector}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Koleksiyona Ürün Ekle</DialogTitle>
            <DialogDescription>
              {selectedCollection?.name} koleksiyonuna eklemek için ürün seçin
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {products
              .filter(p => !selectedCollection?.collection_products?.some(cp => cp.product_id === p.id))
              .map(product => (
                <div
                  key={product.id}
                  className="p-3 border rounded-lg hover:border-purple-500 cursor-pointer transition-colors"
                  onClick={() => {
                    handleAddProductToCollection(selectedCollection.id, product.id);
                    setShowProductSelector(false);
                  }}
                >
                  <h4 className="font-semibold text-sm">{product.title}</h4>
                  <p className="text-purple-600 font-semibold text-sm mt-1">₺{Number(product.price).toFixed(2)}</p>
                  {product.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>}
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal - TODO: Implement edit form */}
      {isEditing && (
        <EditProfileModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setIsEditing(false)}
        />
      )}

      {/* Product Popup */}
      {isAddingProduct && (
        <ProductPopup 
          onClose={() => setIsAddingProduct(false)} 
          onProductAdded={handleProductAdded}
        />
      )}
    </div>
  );
};

// Simple Edit Profile Modal Component
const EditProfileModal = ({ profile, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    username: profile.username || '',
    bio: profile.bio || '',
    website: profile.website || '',
    twitter: profile.twitter || '',
    instagram: profile.instagram || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold mb-6">Profili Düzenle</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Kendinizden bahsedin..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
            <input
              type="text"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value.replace('@', '') })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value.replace('@', '') })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="username"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full min-h-[44px]">
              Kaydet
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 rounded-full min-h-[44px]">
              İptal
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
