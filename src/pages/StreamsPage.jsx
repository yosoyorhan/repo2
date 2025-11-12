import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Video, PlusCircle, Loader2, Zap, User as UserIcon } from 'lucide-react';

const StreamsPage = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchStreams();
    const channel = supabase.channel('public:streams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'streams' }, fetchStreams)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStreams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('streams')
      .select(`
        id,
        title,
        status,
        user_id,
        created_at,
        profiles ( username, full_name, avatar_url )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Yayınlar alınamadı', description: error.message, variant: 'destructive' });
    } else {
      setStreams(data || []);
    }
    setLoading(false);
  };

  const createStream = () => {
    if (!user) {
      toast({ title: 'Giriş yapmalısın!', description: 'Yayın başlatmak için lütfen giriş yap.', variant: 'destructive' });
      return;
    }
    navigate('/start-stream');
  };

  const mockStreams = [
    { id: 'm1', title: 'Vintage Kart Açılışı ��', profiles: { username: 'KartKoleksiyoncusu', avatar_url: 'https://i.pravatar.cc/150?img=11' }, viewers: '2.3k' },
    { id: 'm2', title: 'Retro Oyun Konsolu Tanıtımı', profiles: { username: 'RetroGamer90', avatar_url: 'https://i.pravatar.cc/150?img=12' }, viewers: '1.8k' },
    { id: 'm3', title: 'Sneaker Mezadı - Air Jordan', profiles: { username: 'SneakerKing', avatar_url: 'https://i.pravatar.cc/150?img=13' }, viewers: '3.5k' },
    { id: 'm4', title: 'Anime Figür Koleksiyonu', profiles: { username: 'AnimeLover', avatar_url: 'https://i.pravatar.cc/150?img=14' }, viewers: '920' },
  ];

  const displayStreams = streams.length > 0 ? streams : mockStreams;

  return (
    <div className="min-h-screen bg-[#fbfaff] text-[#1a1333]">
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-300/10 blur-[200px] rounded-full -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600">
            Canlı Yayınlar
          </h1>
          <Button 
            onClick={createStream} 
            disabled={!user}
            className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/50 transition-all"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Yayın Başlat
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="aspect-[3/4] bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                  <div className="w-full h-4 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayStreams.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200 max-w-2xl mx-auto">
            <Video className="h-16 w-16 mx-auto mb-4 text-purple-400" />
            <h2 className="text-2xl font-bold text-[#2b1d5c] mb-2">Henüz Aktif Yayın Yok</h2>
            <p className="text-[#4a4475] mb-6">İlk yayını sen başlat!</p>
            <Button 
              onClick={createStream} 
              disabled={!user}
              className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/50 transition-all"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Yayın Başlat
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayStreams.map((stream) => (
              <Link key={stream.id} to={`/stream/${stream.id}`}>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-100 to-pink-100">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="h-20 w-20 text-purple-300" />
                    </div>
                    <div className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      LIVE
                    </div>
                    {stream.viewers && (
                      <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-mono px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                        <Zap size={12} className="text-yellow-500" fill="currentColor" /> {stream.viewers}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {stream.profiles?.avatar_url ? (
                        <img 
                          src={stream.profiles.avatar_url} 
                          alt={stream.profiles.username} 
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => e.target.src = 'https://placehold.co/40x40/6a4bff/white?text=U'}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center">
                          <UserIcon size={14} className="text-white" />
                        </div>
                      )}
                      <span className="text-sm font-bold text-[#2b1d5c] truncate">
                        {stream.profiles?.username || 'Anonim Kullanıcı'}
                      </span>
                    </div>
                    <h3 className="text-md font-semibold text-[#1a1333] truncate" title={stream.title}>
                      {stream.title}
                    </h3>
                    <p className="text-sm text-orange-600 font-medium">Canlı Yayın</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamsPage;
