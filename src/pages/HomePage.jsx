import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera, ShoppingBag, Users, Eye, TrendingUp, Play, Heart, Zap, MessageCircle } from 'lucide-react';
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
      <div className="flex items-center justify-center h-full bg-cyber-dark">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink"></div>
          <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-white font-sans overflow-hidden relative">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-96 bg-neon-purple/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-pink/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center space-x-2 bg-cyber-deepPurple border border-cyber-border rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-mono text-neon-cyan">Canlı Mezat Sistemi Aktif</span>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Koleksiyonluk Ürünleri <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-pink">
              Canlı Yayında
            </span> Kap.
          </h1>
          
          <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed mb-8">
            Nadir kartlar, retro oyunlar ve sneakerlar. Toplulukla sohbet et, teklif ver ve kazan.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/streams">
              <button className="bg-neon-pink hover:bg-neon-pinkDark text-white px-8 py-4 rounded-xl font-bold text-lg shadow-neon-pink-lg transition-all hover:scale-105 flex items-center gap-2">
                <Play size={20} fill="currentColor" /> Yayınları İzle
              </button>
            </Link>
            <button className="bg-transparent border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 px-8 py-4 rounded-xl font-bold text-lg transition-all">
              Nasıl Çalışır?
            </button>
          </div>
        </motion.div>

        {/* Active Streams Section */}
        {activeStreams.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  Şu Anda Canlı
                </span>
              </h2>
              <Link to="/streams">
                <Button 
                  variant="outline" 
                  className="bg-cyber-surface border-cyber-border hover:border-neon-pink text-white rounded-xl font-mono text-sm"
                >
                  Tümünü Gör
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeStreams.map((stream, index) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <Link to={`/stream/${stream.id}`}>
                    {/* Window-Style Stream Card */}
                    <div className="relative">
                      {/* Glow Effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                      
                      {/* Main Card */}
                      <div className="relative window-style group-hover:scale-[1.02] transition-transform duration-300">
                        
                        {/* Window Header (Mac Style) */}
                        <div className="window-header">
                          <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                          <div className="text-xs font-mono text-gray-500">live_stream.exe</div>
                        </div>

                        {/* Stream Content */}
                        <div className="p-1 bg-cyber-dark">
                          <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden">
                            
                            {/* Placeholder or Thumbnail */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Camera className="w-12 h-12 text-gray-700" />
                            </div>
                            
                            {/* LIVE Badge */}
                            <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> LIVE
                            </div>
                            
                            {/* Viewer Count */}
                            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-mono px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                              <Eye size={12} className="text-neon-cyan" /> {Math.floor(Math.random() * 500) + 50}
                            </div>

                            {/* Interaction Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                  <button className="p-2 bg-cyber-deepPurple rounded-full text-neon-pink hover:bg-neon-pink hover:text-white transition-all">
                                    <Heart size={16} />
                                  </button>
                                  <button className="p-2 bg-cyber-deepPurple rounded-full text-neon-cyan hover:bg-neon-cyan hover:text-white transition-all">
                                    <ShoppingBag size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stream Info Footer */}
                        <div className="bg-cyber-deepPurple p-4 border-t border-cyber-borderLight">
                          <h3 className="text-white font-bold text-sm mb-2 line-clamp-1">
                            {stream.title || 'Canlı Yayın'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-neon-pink to-neon-cyan flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {stream.profiles?.username?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 font-mono">
                              @{stream.profiles?.username || 'anonymous'}
                            </span>
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
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="window-style max-w-md mx-auto">
              <div className="window-header">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs font-mono text-gray-500">no_streams.exe</div>
              </div>
              <div className="p-12 bg-cyber-dark">
                <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Şu anda aktif yayın yok</h3>
                <p className="text-gray-500 mb-6 font-mono text-sm">// İlk yayını sen başlat!</p>
                <Link to="/streams">
                  <button className="bg-neon-pink hover:bg-neon-pinkDark text-white px-6 py-3 rounded-lg font-bold text-sm shadow-neon-pink transition-all flex items-center gap-2 mx-auto">
                    <Camera className="h-4 w-4" />
                    Yayın Başlat
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { title: 'Hızlı Kargo', icon: '📦', desc: 'Güvenli ve sigortalı gönderim.' },
            { title: 'Orijinallik', icon: '🛡️', desc: 'Uzmanlar tarafından doğrulandı.' },
            { title: 'Topluluk', icon: '👾', desc: 'Benzer ilgi alanlarına sahip kişiler.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
              className="p-6 rounded-2xl bg-cyber-darkPurple border border-cyber-border hover:border-neon-pink/50 transition-colors group cursor-default"
            >
              <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-500">{item.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
