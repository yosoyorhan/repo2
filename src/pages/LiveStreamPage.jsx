import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Send, 
  Share2, 
  X, 
  ShoppingBag, 
  VolumeX,
  Maximize,
  ChevronDown,
  Info,
  Zap,
  User as UserIcon
} from 'lucide-react';
import LiveStream from '@/components/LiveStream';
import ErrorBoundary from '@/components/ErrorBoundary';
import ChatPanel from '@/components/ChatPanel';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';

// StreamInfo Component - Yayıncı bilgileri
const StreamInfo = ({ streamData, onFollow }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (streamData?.user_id) {
      supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', streamData.user_id)
        .single()
        .then(({ data }) => setProfile(data));
    }
  }, [streamData?.user_id]);

  const displayName = profile?.username || profile?.full_name || 'Anonim';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="w-12 h-12 rounded-full border-2 border-purple-300 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl border-2 border-purple-300"
            style={{ display: avatarUrl ? 'none' : 'flex' }}
          >
            {displayName[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1a1333]">{displayName}</h1>
            <p className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
              {streamData?.title || 'Canlı Yayın'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <Button 
            onClick={onFollow}
            className="bg-purple-600 text-white font-bold px-4 py-2 rounded-full text-sm hover:bg-purple-700"
          >
            Takip Et
          </Button>
        </div>
      </div>
    </div>
  );
};

// ProductListItem Component
const ProductListItem = ({ product, onBidClick }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    {product.image_url && (
      <img 
        src={product.image_url} 
        alt={product.title} 
        className="w-16 h-16 rounded-md object-cover flex-shrink-0"
        onError={(e) => e.target.src = 'https://placehold.co/100x100/eceaff/6a4bff?text=Ürün'}
      />
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate">{product.title}</p>
      <p className="text-lg font-bold text-purple-600">₺{Number(product.price).toFixed(2)}</p>
    </div>
    <Button 
      onClick={() => onBidClick(product)}
      className="text-white font-bold px-3 py-1.5 rounded-full text-sm bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg shadow-pink-500/30"
      disabled={product.is_sold}
    >
      {product.is_sold ? 'Satıldı' : 'Teklif'}
    </Button>
  </div>
);

// ProductList Component - Masaüstü
const ProductList = ({ products, onBidClick }) => (
  <div className="flex flex-col h-full bg-white rounded-xl shadow-md border border-gray-200">
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-lg font-bold text-[#1a1333]">Yayındaki Ürünler</h2>
    </div>
    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
      {products.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">Henüz ürün yok</p>
      ) : (
        products.map(product => (
          <ProductListItem key={product.id} product={product} onBidClick={onBidClick} />
        ))
      )}
    </div>
    {products.length > 0 && (
      <div className="p-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">{products.length} ürün listelendi</p>
      </div>
    )}
  </div>
);

// ProductBottomSheet Component - Mobil
const ProductBottomSheet = ({ isOpen, onClose, products, onBidClick }) => (
  <>
    <div 
      className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    />
    <div 
      className={`fixed bottom-0 left-0 right-0 w-full h-[60vh] bg-[#fbfaff] rounded-t-2xl shadow-2xl z-50 p-4 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <h2 className="text-lg font-bold text-[#1a1333]">Yayındaki Ürünler ({products.length})</h2>
        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
          <ChevronDown size={24} />
        </button>
      </div>
      <div className="flex-1 py-3 space-y-3 overflow-y-auto">
        {products.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">Henüz ürün yok</p>
        ) : (
          products.map(product => (
            <ProductListItem key={product.id} product={product} onBidClick={onBidClick} />
          ))
        )}
      </div>
    </div>
  </>
);

const LiveStreamPage = () => {
  const { streamId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [streamData, setStreamData] = useState(null);
  const [products, setProducts] = useState([]);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  
  // StartStreamPage'den gelen koleksiyon bilgisi
  const collectionId = location.state?.collectionId;
  const collectionName = location.state?.collectionName;

  useEffect(() => {
    // Stream verilerini çek
    const fetchStreamData = async () => {
      const { data, error } = await supabase
        .from('streams')
        .select('*')
        .eq('id', streamId)
        .single();
      
      if (!error && data) {
        setStreamData(data);
      }
    };

    fetchStreamData();

    // Stream updates için realtime subscription
    const streamChannel = supabase
      .channel(`stream-${streamId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'streams',
        filter: `id=eq.${streamId}`
      }, (payload) => {
        setStreamData(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(streamChannel);
    };
  }, [streamId]);

  const handleFollow = () => {
    // Takip etme mantığı buraya
    console.log('Takip edildi');
  };

  const handleBidClick = (product) => {
    // Teklif verme modal'ı açılabilir
    console.log('Teklif verilecek ürün:', product);
  };

  const handleGoBack = () => {
    navigate('/streams');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#fbfaff] text-[#1a1333] font-sans">
        
        {/* MASAÜSTÜ GÖRÜNÜMÜ (3 SÜTUN) */}
        <div className="hidden lg:grid grid-cols-[360px_1fr_360px] h-screen max-h-screen overflow-hidden p-6 gap-6">
          
          {/* SOL SÜTUN: Bilgi + Ürünler */}
          <div className="h-full max-h-screen overflow-y-auto space-y-4 pr-2">
            <StreamInfo streamData={streamData} onFollow={handleFollow} />
            <ProductList products={products} onBidClick={handleBidClick} />
          </div>

          {/* ORTA SÜTUN: Dikey Video (LiveStream Component) */}
          <div className="h-full max-h-screen flex items-center justify-center overflow-hidden">
            <div className="aspect-[9/16] w-full max-w-md mx-auto">
              <LiveStream 
                streamId={streamId} 
                initialCollectionId={collectionId}
                initialCollectionName={collectionName}
                onProductsUpdate={setProducts}
                layoutMode="vertical"
              />
            </div>
          </div>

          {/* SAĞ SÜTUN: Canlı Sohbet */}
          <div className="h-full max-h-screen">
            <ChatPanel streamId={streamId} />
          </div>

        </div>

        {/* MOBİL GÖRÜNÜM (Tam Ekran) */}
        <div className="lg:hidden relative w-screen h-screen overflow-hidden">
          
          {/* Video Arka Planı */}
          <div className="absolute inset-0 w-full h-full -z-10">
            <LiveStream 
              streamId={streamId} 
              initialCollectionId={collectionId}
              initialCollectionName={collectionName}
              onProductsUpdate={setProducts}
              layoutMode="mobile"
            />
          </div>

          {/* Mobil Overlay (Butonlar, Bilgiler) */}
          <div className="absolute inset-0 z-10 flex flex-col justify-between text-white p-4">
            
            {/* Üst Butonlar */}
            <div className="flex items-start justify-between">
              <button 
                onClick={handleGoBack}
                className="p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors shadow-md backdrop-blur-sm"
              >
                <X size={20} className="text-white" />
              </button>
              
              {/* LIVE Badge + Viewer Count */}
              <div className="flex items-center space-x-2">
                <div className="bg-pink-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  LIVE
                </div>
                <div className="bg-black/50 text-white text-xs font-mono px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                  <Zap size={12} className="text-yellow-500" fill="currentColor" /> {viewerCount || 0}
                </div>
              </div>

              <button 
                className="p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors shadow-md backdrop-blur-sm"
              >
                <Info size={20} className="text-white" />
              </button>
            </div>
            
            {/* Alt Butonlar */}
            <div className="flex items-end justify-between">
              {/* Sağ taraftaki ikonlar */}
              <div className="flex-1" />
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsProductSheetOpen(true)}
                  className="p-2.5 bg-black/40 rounded-full hover:bg-black/60 transition-colors relative backdrop-blur-sm shadow-md"
                >
                  <ShoppingBag size={22} />
                  {products.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black/50">
                      {products.length}
                    </span>
                  )}
                </button>
                <button className="p-2.5 bg-black/40 rounded-full hover:bg-black/60 transition-colors backdrop-blur-sm shadow-md">
                  <Heart size={22} />
                </button>
                <button className="p-2.5 bg-black/40 rounded-full hover:bg-black/60 transition-colors backdrop-blur-sm shadow-md">
                  <Share2 size={22} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Chat Panel (Mobil - Floating) */}
          <div className="absolute bottom-24 left-4 right-4 pointer-events-none">
            <ChatPanel streamId={streamId} isMobile />
          </div>
          
          {/* Ürün Çekmecesi */}
          <ProductBottomSheet 
            isOpen={isProductSheetOpen} 
            onClose={() => setIsProductSheetOpen(false)}
            products={products}
            onBidClick={handleBidClick}
          />
          
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default LiveStreamPage;