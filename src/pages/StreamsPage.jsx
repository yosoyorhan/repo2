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
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Canlı Yayınlar</h1>
        <Button onClick={createStream} disabled={creating || !user} className="bg-[#FFDE59] text-gray-900 hover:bg-[#FFD700] rounded-full">
          {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          Yeni Yayın Başlat
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-[#FFDE59]" />
        </div>
      ) : streams.length === 0 ? (
        <div className="text-center py-16 bg-gray-100 rounded-2xl">
          <Video className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold">Şu anda aktif yayın bulunmuyor.</h3>
          <p className="text-gray-500 mt-2">İlk yayını sen başlat!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream, index) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/live/${stream.id}`}>
                <div className="bg-white rounded-2xl p-4 border border-transparent hover:border-[#FFDE59] transition-all cursor-pointer shadow-sm hover:shadow-lg">
                  <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center relative">
                    <Video className="h-12 w-12 text-white" />
                     <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        CANLI
                      </div>
                  </div>
                  <h4 className="font-bold text-lg">{stream.title}</h4>
                  <p className="text-gray-500 text-sm">Yayıncı: {stream.profiles?.username || 'Bilinmiyor'}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StreamsPage;