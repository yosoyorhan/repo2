import { ArrowLeft, Users, Heart, X, Pin, Eye } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const MOCK_COLLECTION_PRODUCTS = [
  {
    id: '1',
    title: 'Charizard GX Pokemon Kartı',
    price: 450,
    image: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=300',
    isPinned: true
  },
  {
    id: '2',
    title: 'Pikachu VMAX Holo',
    price: 280,
    image: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=300',
    isPinned: false
  },
  {
    id: '3',
    title: 'Magic Black Lotus Repro',
    price: 120,
    image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=300',
    isPinned: false
  },
  {
    id: '4',
    title: 'Rare Holographic Set',
    price: 750,
    image: 'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=300',
    isPinned: false
  }
];

const MOCK_CHAT_MESSAGES = [
  { id: '1', user: 'Ali', message: 'Bu kartı alabilir miyim?', timestamp: '2 dk önce' },
  { id: '2', user: 'Zeynep', message: 'Harika açılım! 🔥', timestamp: '1 dk önce' },
  { id: '3', user: 'Mehmet', message: 'Fiyat çok uygun', timestamp: '30 sn önce' }
];

export function LiveStreamSeller({ currentUser }: { currentUser: any }) {
  const navigate = useNavigate();
  const { streamId } = useParams();
  const [viewers, setViewers] = useState(1247);
  const [likes, setLikes] = useState(3421);
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT_MESSAGES);
  const [products, setProducts] = useState(MOCK_COLLECTION_PRODUCTS);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const pinnedProduct = products.find(p => p.isPinned);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Simulate new messages
  useEffect(() => {
    const interval = setInterval(() => {
      const newMsg = {
        id: Date.now().toString(),
        user: ['Ayşe', 'Can', 'Deniz', 'Ece'][Math.floor(Math.random() * 4)],
        message: ['Harika! 🎉', 'Bu ürünü sevdim', 'Fiyat ne kadar?', 'Stokta var mı?'][Math.floor(Math.random() * 4)],
        timestamp: 'Şimdi'
      };
      setChatMessages(prev => [...prev, newMsg]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handlePinProduct = (productId: string) => {
    setProducts(products.map(p => ({
      ...p,
      isPinned: p.id === productId
    })));
  };

  const handleEndStream = () => {
    navigate('/');
  };

  return (
    <div className="h-screen flex flex-col bg-black md:bg-gradient-to-br md:from-purple-50 md:via-pink-50 md:to-orange-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="text-sm">CANLI</span>
            </div>
            <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">{viewers.toLocaleString()}</span>
            </div>
            <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{likes.toLocaleString()}</span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowEndConfirm(true)}
            className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm"
          >
            Bitir
          </button>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Left: Camera Feed */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-black rounded-2xl aspect-video relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center">
              <div className="text-center">
                <Eye className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <p className="text-white/50 text-xl">Kameranızın Görüntüsü</p>
                <p className="text-white/30 text-sm mt-2">İzleyiciler sizi bu ekrandan görüyor</p>
              </div>
            </div>
            
            <div className="absolute top-4 left-4 flex gap-3">
              <div className="bg-red-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="text-sm">CANLI YAYINDASINIZ</span>
              </div>
              <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">{viewers.toLocaleString()}</span>
              </div>
              <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{likes.toLocaleString()}</span>
              </div>
            </div>

            <div className="absolute bottom-4 right-4">
              <button 
                onClick={() => setShowEndConfirm(true)}
                className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition-colors"
              >
                Yayını Bitir
              </button>
            </div>

            {/* Pinned Product Overlay (what viewers see) */}
            {pinnedProduct && (
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <ImageWithFallback 
                      src={pinnedProduct.image} 
                      alt={pinnedProduct.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full inline-block mb-1">
                      Şu An Satışta
                    </div>
                    <p className="text-gray-900 text-sm line-clamp-1">{pinnedProduct.title}</p>
                    <p className="text-purple-600 text-sm">₺{pinnedProduct.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">Toplam İzlenme</p>
                <p className="text-gray-900 text-xl">{(viewers * 1.3).toFixed(0)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">Aktif İzleyici</p>
                <p className="text-gray-900 text-xl">{viewers}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">Satış</p>
                <p className="text-gray-900 text-xl">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Chat & Products */}
        <div className="w-96 flex flex-col gap-4">
          {/* Chat */}
          <div className="flex-1 bg-white rounded-2xl shadow-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-gray-900">Canlı Sohbet</h3>
              <p className="text-gray-500 text-sm">İzleyicilerin mesajlarını buradan takip edin</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(msg => (
                <div key={msg.id} className="animate-fadeIn">
                  <p className="text-gray-900 text-sm">
                    <span className="text-purple-600">{msg.user}:</span> {msg.message}
                  </p>
                  <p className="text-gray-400 text-xs">{msg.timestamp}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Products Panel */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden max-h-96">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-gray-900">Koleksiyondaki Ürünler</h3>
              <p className="text-gray-500 text-sm">Ürüne tıklayarak öne çıkarın</p>
            </div>
            
            <div className="overflow-y-auto max-h-80">
              <div className="p-4 space-y-2">
                {products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handlePinProduct(product.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      product.isPinned
                        ? 'bg-purple-50 border-2 border-purple-400'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <ImageWithFallback 
                        src={product.image} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-gray-900 text-sm truncate">{product.title}</p>
                      <p className="text-purple-600 text-sm">₺{product.price.toLocaleString()}</p>
                    </div>
                    {product.isPinned && (
                      <div className="bg-purple-600 text-white p-2 rounded-full">
                        <Pin className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Camera View */}
      <div className="md:hidden flex-1 relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center">
          <div className="text-center">
            <Eye className="w-12 h-12 text-white/50 mx-auto mb-2" />
            <p className="text-white/50">Kamera Görüntüsü</p>
          </div>
        </div>

        {/* Mobile Chat Overlay */}
        <div className="absolute top-20 left-0 right-0 max-h-48 overflow-y-auto p-4 pointer-events-none">
          <div className="space-y-2">
            {chatMessages.slice(-5).map(msg => (
              <div key={msg.id} className="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg max-w-[80%]">
                <p className="text-sm">
                  <span className="text-purple-300">{msg.user}:</span> {msg.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pinned Product (Mobile) */}
        {pinnedProduct && (
          <div className="absolute bottom-20 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <ImageWithFallback 
                  src={pinnedProduct.image} 
                  alt={pinnedProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full inline-block mb-1">
                  Öne Çıkan
                </div>
                <p className="text-gray-900 text-sm line-clamp-1">{pinnedProduct.title}</p>
                <p className="text-purple-600 text-sm">₺{pinnedProduct.price.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Product Selection Bottom Sheet */}
      <div className="md:hidden bg-white rounded-t-3xl p-4 shadow-2xl max-h-48 overflow-y-auto">
        <h4 className="text-gray-900 mb-3">Ürün Öne Çıkar</h4>
        <div className="space-y-2">
          {products.map(product => (
            <button
              key={product.id}
              onClick={() => handlePinProduct(product.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                product.isPinned
                  ? 'bg-purple-50 border-2 border-purple-400'
                  : 'bg-gray-50 border-2 border-transparent'
              }`}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                <ImageWithFallback 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-gray-900 text-sm truncate">{product.title}</p>
                <p className="text-purple-600 text-xs">₺{product.price.toLocaleString()}</p>
              </div>
              {product.isPinned && <Pin className="w-4 h-4 text-purple-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* End Stream Confirmation */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-gray-900 mb-2">Yayını Bitir?</h3>
            <p className="text-gray-600 mb-6">Yayını sonlandırmak istediğinizden emin misiniz?</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleEndStream}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Bitir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
