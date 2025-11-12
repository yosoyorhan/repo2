import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Video, PlusCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StreamsPage = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStreams = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('streams')
        .select(`
          id,
          title,
          status,
          user_id,
          profiles ( username )
        `)
        .eq('status', 'active');
      
      if (error) {
        toast({ title: 'Yayınlar alınamadı', description: error.message, variant: 'destructive' });
      } else {
        setStreams(data || []);
      }
      setLoading(false);
    };

    fetchStreams();

    const channel = supabase.channel('public:streams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'streams' }, fetchStreams)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const createStream = async () => {
    if (!user) {
      toast({ title: 'Giriş yapmalısın!', description: 'Yayın başlatmak için lütfen giriş yap.', variant: 'destructive' });
      return;
    }
    setCreating(true);
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
    const title = `${profile?.username || user.email}'s Stream`;

    const { data, error } = await supabase
      .from('streams')
      .insert({ title, user_id: user.id, status: 'scheduled' })
      .select()
      .single();

    if (error) {
      toast({ title: 'Yayın oluşturulamadı', description: error.message, variant: 'destructive' });
    } else {
      navigate(`/live/${data.id}`);
    }
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-white">
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto p-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-cyan">Canlı Yayınlar</h1>
          <Button onClick={createStream} disabled={creating || !user}>
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Yeni Yayın Başlat
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-neon-pink" />
              <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-neon-cyan" style={{ animationDirection: 'reverse' }} />
            </div>
          </div>
        ) : streams.length === 0 ? (
          <div className="text-center py-16 window-style max-w-2xl mx-auto">
            <div className="window-header">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-xs font-mono text-gray-500">no_streams.exe</div>
            </div>
            <div className="p-12 bg-cyber-dark">
              <Video className="mx-auto h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-300">Şu anda aktif yayın bulunmuyor.</h3>
              <p className="text-gray-500 mt-2 font-mono text-sm">// İlk yayını sen başlat!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map((stream, index) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group"
              >
                <Link to={`/live/${stream.id}`}>
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative window-style group-hover:scale-[1.02] transition-transform">
                      <div className="window-header">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-xs font-mono text-gray-500">live_stream.exe</div>
                      </div>
                      <div className="p-1 bg-cyber-dark">
                        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                          <Video className="h-12 w-12 text-gray-700" />
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            CANLI
                          </div>
                        </div>
                      </div>
                      <div className="bg-cyber-deepPurple p-4 border-t border-cyber-borderLight">
                        <h4 className="font-bold text-lg text-white mb-1">{stream.title}</h4>
                        <p className="text-gray-400 text-sm font-mono">@{stream.profiles?.username || 'anonymous'}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamsPage;