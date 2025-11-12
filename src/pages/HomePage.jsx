import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Zap, Globe, Home, PlusCircle, User, Search, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// Sidebar Component
const Sidebar = ({ user }) => {
  const [activeCategory, setActiveCategory] = useState('Sizin İçin');
  
  const categories = [
    { name: 'Sizin İçin', link: '/' },
    { name: 'Erkek Modası', link: '/streams' },
    { name: 'Şeker & Atıştırmalık', link: '/streams' },
    { name: 'Yiyecek & İçecek', link: '/streams' },
    { name: 'Sokak Giyimi', link: '/streams' },
    { name: 'Oyuncak & Hobi', link: '/streams' },
    { name: 'Sneakers', link: '/streams' },
    { name: 'Vintage Giyim', link: '/streams' },
    { name: 'Diğer Oyuncaklar', link: '/streams' },
    { name: 'Modern Sanat', link: '/streams' },
    { name: 'Labubu & Sürpriz Kutu', link: '/streams' },
    { name: 'Paletler', link: '/streams' },
  ];

  const footerLinks = ['Blog', 'Kariyer', 'Hakkımızda', 'SSS', 'Partnerler'];
  const legalLinks = ['Gizlilik', 'Koşullar', 'İletişim'];

  const getUserDisplayName = () => {
    if (!user) return 'Kullanıcı';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanıcı';
  };

  return (
    <aside className="hidden lg:block w-60 h-[calc(100vh-80px)] sticky top-20 bg-[#fcfbff] border-r border-gray-200 p-6 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-[#1a1333] mb-4">Merhaba, {getUserDisplayName()}!</h2>
        <nav className="flex flex-col space-y-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.link}
              onClick={() => setActiveCategory(cat.name)}
              className={`text-md ${
                activeCategory === cat.name
                  ? 'text-purple-600 font-bold border-r-2 border-purple-600'
                  : 'text-[#4a4475] hover:text-pink-500'
              } transition-colors pr-2`}
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#4a4475]">
          {footerLinks.map(link => (
            <a key={link} href="#" className="hover:text-pink-500">{link}</a>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#4a4475] mt-2">
          {legalLinks.map(link => (
            <a key={link} href="#" className="hover:text-pink-500">{link}</a>
          ))}
        </div>
        <button className="flex items-center space-x-2 text-sm text-[#4a4475] hover:text-pink-500 mt-4 transition-colors">
          <Globe size={16} />
          <span>Türkçe</span>
        </button>
        <p className="text-xs text-[#4a4475]/60 mt-4">© 2025 Livenner Inc.</p>
      </div>
    </aside>
  );
};

// Live Stream Card
const LiveStreamCard = ({ user, title, category, viewers, imgUrl, userImg }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
    <div className="relative aspect-[3/4]">
      <img 
        src={imgUrl} 
        alt={title} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        onError={(e) => e.target.src = 'https://placehold.co/300x400/eceaff/6a4bff?text=Yayın'}
      />
      <div className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        LIVE
      </div>
      <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-mono px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
        <Zap size={12} className="text-yellow-500" fill="currentColor" /> {viewers}
      </div>
    </div>
    <div className="p-3 sm:p-4">
      <div className="flex items-center space-x-2 mb-2">
        <img 
          src={userImg} 
          alt={user} 
          className="w-6 h-6 rounded-full object-cover transition-transform group-hover:scale-110" 
          onError={(e) => e.target.src = 'https://placehold.co/40x40/6a4bff/white?text=U'}
        />
        <span className="text-sm font-bold text-[#2b1d5c] truncate">{user}</span>
      </div>
      <h3 className="text-md font-semibold text-[#1a1333] truncate" title={title}>{title}</h3>
      <p className="text-sm text-orange-600 font-medium truncate">{category}</p>
    </div>
  </div>
);

// Loading Skeleton
const LiveStreamCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
    <div className="relative aspect-[3/4] bg-gray-200 animate-pulse"></div>
    <div className="p-3 sm:p-4">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="w-full h-4 bg-gray-200 animate-pulse rounded mb-1.5"></div>
      <div className="w-1/2 h-4 bg-gray-200 animate-pulse rounded"></div>
    </div>
  </div>
);

// Category Scroll Card
const CategoryScrollCard = ({ title, viewers, imgUrl }) => (
  <div className="flex-shrink-0 w-64 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group">
    <div className="relative h-24 overflow-hidden">
      <img 
        src={imgUrl} 
        alt={title} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => e.target.src = 'https://placehold.co/256x96/eceaff/6a4bff?text=Kategori'}
      />
    </div>
    <div className="p-4">
      <h3 className="text-md font-bold text-[#2b1d5c] truncate">{title}</h3>
      <p className="text-sm text-[#4a4475]">{viewers} İzleyici</p>
    </div>
  </div>
);

const HomePage = () => {
  const [activeStreams, setActiveStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveStreams();
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
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
        .limit(8);

      if (error) throw error;
      setActiveStreams(data || []);
    } catch (error) {
      console.error('Error fetching streams:', error);
    }
  };

  const mockStreams = [
    { id: 1, user: 'Koleksiyoncu', title: 'Nadir Pokemon Kartları Açılışı!', category: 'Kartlar', viewers: '8.2k', imgUrl: 'https://images.unsplash.com/photo-1542779283-429940ce8336?w=400', userImg: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, user: 'SneakerHead', title: 'Yeni Gelenler: Air Jordan 1', category: 'Sneakers', viewers: '4.1k', imgUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400', userImg: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, user: 'RetroOyun', title: 'SNES Klasikleri | Canlı Oynanış', category: 'Retro Oyunlar', viewers: '2.5k', imgUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', userImg: 'https://i.pravatar.cc/150?img=3' },
    { id: 4, user: 'ModaAvcısı', title: 'Vintage Tişört Pazarı', category: 'Vintage Giyim', viewers: '1.8k', imgUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400', userImg: 'https://i.pravatar.cc/150?img=4' },
  ];

  const categoriesLike = [
    { id: 1, title: 'Şeker & Atıştırmalık', viewers: '325 İzleyici', imgUrl: 'https://images.unsplash.com/photo-1560925077-ef0a43ac7c7c?w=400' },
    { id: 2, title: 'Yiyecek & İçecek', viewers: '180 İzleyici', imgUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' },
    { id: 3, title: 'Sokak Giyimi', viewers: '561 İzleyici', imgUrl: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=400' },
    { id: 4, title: 'Vintage Giyim', viewers: '372 İzleyici', imgUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400' },
  ];

  const displayStreams = activeStreams.length > 0 ? activeStreams.map(s => ({
    id: s.id,
    user: s.profiles?.username || 'Anonim',
    title: s.title || 'Canlı Yayın',
    category: 'Canlı',
    viewers: '0',
    imgUrl: 'https://placehold.co/300x400/eceaff/6a4bff?text=Live',
    userImg: s.profiles?.avatar_url || 'https://placehold.co/40x40/6a4bff/white?text=U'
  })) : mockStreams;

  return (
    <div className="min-h-screen bg-[#fbfaff] text-[#1a1333] font-sans relative">
      <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-[70%] h-[300px] bg-pink-300/10 blur-[200px] rounded-full -z-10"></div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        <Sidebar user={user} />
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24">
          <main>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <LiveStreamCardSkeleton key={index} />
                ))
              ) : (
                displayStreams.map(stream => (
                  <Link key={stream.id} to={`/live/${stream.id}`}>
                    <LiveStreamCard {...stream} />
                  </Link>
                ))
              )}
            </div>
          </main>

          <section className="my-8 lg:my-10">
            <h2 className="text-2xl font-bold text-[#1a1333] mb-4">Sevebileceğin Kategoriler</h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
              {categoriesLike.map(cat => (
                <CategoryScrollCard key={cat.id} {...cat} />
              ))}
            </div>
          </section>

          <section>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <LiveStreamCardSkeleton key={`skeleton-${index}`} />
                ))
              ) : (
                [...displayStreams].reverse().map(stream => (
                  <Link key={`rev-${stream.id}`} to={`/live/${stream.id}`}>
                    <LiveStreamCard {...stream} />
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#fbfaff] border-t-2 border-gray-200 z-40 grid grid-cols-5 items-center">
        <Link to="/" className="flex flex-col items-center justify-center text-purple-600">
          <Home size={24} />
          <span className="text-xs font-bold">Anasayfa</span>
        </Link>
        <Link to="/streams" className="flex flex-col items-center justify-center text-[#4a4475] hover:text-pink-500 transition-colors">
          <Search size={24} />
          <span className="text-xs font-medium">Keşfet</span>
        </Link>
        <button 
          onClick={() => {
            if (!user) {
              toast({ title: 'Giriş yapmalısın!', description: 'Yayın başlatmak için lütfen giriş yap.' });
              return;
            }
            navigate('/streams');
          }}
          className="flex flex-col items-center justify-center text-[#4a4475] hover:text-pink-500 transition-colors"
        >
          <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white rounded-full p-2 -mt-5 shadow-lg shadow-pink-500/50">
            <PlusCircle size={24} />
          </div>
          <span className="text-xs font-medium mt-1.5">Yayın Yap</span>
        </button>
        <Link to="/streams" className="flex flex-col items-center justify-center text-[#4a4475] hover:text-pink-500 transition-colors">
          <Bookmark size={24} />
          <span className="text-xs font-medium">Kaydedilen</span>
        </Link>
        <Link 
          to={user ? `/profile/${user.id}` : '/streams'} 
          className="flex flex-col items-center justify-center text-[#4a4475] hover:text-pink-500 transition-colors"
        >
          <User size={24} />
          <span className="text-xs font-medium">Profil</span>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
