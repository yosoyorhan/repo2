import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera, ShoppingBag, Users, Eye, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const HomePage = () => {
  const [activeStreams, setActiveStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveStreams();
    
    // Realtime subscription for new streams
    const streamChannel = supabase.channel('active-streams')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'streams',
        filter: 'status=eq.active'
      }, () => {
        fetchActiveStreams();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(streamChannel);
    };
  }, []);

  const fetchActiveStreams = async () => {
    try {
      const { data, error } = await supabase
        .from('streams')
        .select(`
          id,
          title,
          status,
          created_at,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setActiveStreams(data || []);
    } catch (error) {
      console.error('Error fetching streams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 p-4 md:p-8">
      {/* Hero Section */}
      <div className="text-center mb-12 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-gradient-to-r from-[#7b3fe4] to-[#e53dd2] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_20px_50px_rgba(123,63,228,0.20)]">
            <span className="text-4xl font-bold text-white">L</span>
          </div>
        </motion.div>
        <motion.h1 
          className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-[#7b3fe4] to-[#e53dd2] bg-clip-text text-transparent mb-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Canlı Alışverişin Kalbi
        </motion.h1>
        <motion.p 
          className="text-base md:text-lg text-gray-600 max-w-xl mx-auto mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Sevdiğin markaların canlı yayınlarını izle, özel ürünleri keşfet ve anında satın al
        </motion.p>
      </div>

      {/* Active Streams Section */}
      {activeStreams.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6 max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              Şu Anda Canlı
            </h2>
            <Link to="/streams">
              <Button variant="outline" className="rounded-2xl">
                Tümünü Gör
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {activeStreams.map((stream, index) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link to={`/stream/${stream.id}`}>
                  <div className="group relative bg-white/40 backdrop-blur-lg rounded-2xl border border-white/40 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                    {/* Live Badge */}
                    <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      CANLI
                    </div>

                    {/* Stream Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center relative overflow-hidden">
                      <Camera className="w-16 h-16 text-white/50" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                    </div>

                    {/* Stream Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {stream.title || 'Canlı Yayın'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {stream.profiles?.username?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 font-medium truncate">
                            {stream.profiles?.username || 'Anonim'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">Şu anda aktif yayın yok</h3>
          <p className="text-gray-400 mb-6">İlk yayını sen başlat!</p>
          <Link to="/streams">
            <Button className="rounded-2xl">
              <Camera className="mr-2 h-5 w-5" />
              Yayın Başlat
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default HomePage;