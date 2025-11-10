import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Calendar, Globe, Twitter, Instagram, Users, Video, Edit, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [streams, setStreams] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const isOwnProfile = user && profile && user.id === profile.id;

  useEffect(() => {
    fetchProfile();
    fetchStreams();
    if (user && userId) {
      checkFollowStatus();
    }
  }, [userId, user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
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
            {/* Avatar and basic info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    profile.username?.[0]?.toUpperCase() || 'U'
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
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{profile.username || 'Kullanıcı'}</h1>
                    <p className="text-gray-500 mt-1">{profile.email}</p>
                  </div>
                  
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

        {/* Streams Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Video className="h-6 w-6" />
            Son Yayınlar
          </h2>
          
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
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md cursor-pointer"
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
        </div>
      </div>

      {/* Edit Profile Modal - TODO: Implement edit form */}
      {isEditing && (
        <EditProfileModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setIsEditing(false)}
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
