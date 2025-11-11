import { ArrowLeft, Send, Heart, Share2, MoreVertical, X, ShoppingBag, Package } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const MOCK_STREAM = {
  id: '1',
  title: 'Nadir Pokemon Kartları Açılımı! 🔥',
  seller: {
    id: '1',
    name: 'Kart Dünyası',
    username: 'kartdunyasi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kartdunyasi'
  },
  viewers: 1247,
  likes: 3421
};

const MOCK_FEATURED_PRODUCT = {
  id: '1',
  title: 'Charizard GX Pokemon Kartı - Holografik',
  price: 450,
  image: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=300',
  inStock: true,
  description: 'Ultra nadir holografik kart, mükemmel durumda'
};

const MOCK_COLLECTION_PRODUCTS = [
  {
    id: '2',
    title: 'Pikachu VMAX',
    price: 280,
    image: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=300'
  },
  {
    id: '3',
    title: 'Magic Black Lotus',
    price: 120,
    image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=300'
  },
  {
    id: '4',
    title: 'Rare Holo Set',
    price: 750,
    image: 'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=300'
  }
];

const MOCK_CHAT_MESSAGES = [
  { id: '1', user: 'Ali', message: 'Bu kartı alabilir miyim?', timestamp: '2 dk önce' },
  { id: '2', user: 'Zeynep', message: 'Harika açılım! 🔥', timestamp: '1 dk önce' },
  { id: '3', user: 'Mehmet', message: 'Fiyat çok uygun', timestamp: '30 sn önce' }
];

export function LiveStreamViewer({ currentUser }: { currentUser: any }) {
  const navigate = useNavigate();
  const { streamId } = useParams();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT_MESSAGES);
  const [showProducts, setShowProducts] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        user: currentUser.name,
        message: message,
        timestamp: 'Şimdi'
      };
      setChatMessages([...chatMessages, newMessage]);
      setMessage('');
    }
  };

  const handleBuyNow = () => {
    navigate(`/checkout/${MOCK_FEATURED_PRODUCT.id}`);
  };

  return (
    <div className="h-screen flex flex-col bg-black md:bg-gradient-to-br md:from-purple-50 md:via-pink-50 md:to-orange-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-30 p-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="bg-red-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="text-sm">CANLI</span>
            </div>
            <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
              {MOCK_STREAM.viewers.toLocaleString()} izleyici
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <img 
            src={MOCK_STREAM.seller.avatar} 
            alt={MOCK_STREAM.seller.name}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div className="flex-1">
            <p className="text-white">{MOCK_STREAM.seller.name}</p>
            <p className="text-white/70 text-sm">{MOCK_STREAM.title}</p>
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-sm">
            Takip Et
          </button>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Left: Video */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-black rounded-2xl aspect-video relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center">
              <p className="text-white/50 text-xl">Canlı Video Akışı</p>
            </div>
            
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="text-sm">CANLI</span>
            </div>
            
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
              {MOCK_STREAM.viewers.toLocaleString()} izleyici
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={MOCK_STREAM.seller.avatar} 
                  alt={MOCK_STREAM.seller.name}
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <div className="flex-1">
                  <p className="text-white">{MOCK_STREAM.seller.name}</p>
                  <p className="text-white/70 text-sm">{MOCK_STREAM.title}</p>
                </div>
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full">
                  Takip Et
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Chat & Products */}
        <div className="w-80 flex flex-col gap-4">
          {/* Chat */}
          <div className="flex-1 bg-white rounded-2xl shadow-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-gray-900">Canlı Sohbet</h3>
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

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Mesaj yaz..."
                  className="flex-1 px-4 py-2 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-full hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Video (Full Screen) */}
      <div className="md:hidden flex-1 relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center">
          <p className="text-white/50">Canlı Video Akışı</p>
        </div>

        {/* Mobile Chat Overlay */}
        <div className="absolute bottom-0 left-0 right-0 max-h-48 overflow-y-auto p-4 pointer-events-none">
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

        {/* Floating Action Buttons */}
        <div className="absolute right-4 bottom-32 flex flex-col gap-3">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="bg-black/50 backdrop-blur-sm text-white p-3 rounded-full flex flex-col items-center"
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-xs mt-1">{MOCK_STREAM.likes.toLocaleString()}</span>
          </button>
          
          <button className="bg-black/50 backdrop-blur-sm text-white p-3 rounded-full">
            <Share2 className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setShowProducts(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full"
          >
            <Package className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile: Bottom Product Card */}
      <div className="md:hidden bg-white rounded-t-3xl p-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            <ImageWithFallback 
              src={MOCK_FEATURED_PRODUCT.image} 
              alt={MOCK_FEATURED_PRODUCT.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-gray-900 text-sm line-clamp-2 mb-1">
              {MOCK_FEATURED_PRODUCT.title}
            </h4>
            <p className="text-purple-600 mb-2">₺{MOCK_FEATURED_PRODUCT.price.toLocaleString()}</p>
          </div>
          
          <button
            onClick={handleBuyNow}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full whitespace-nowrap hover:shadow-lg transition-all"
          >
            Satın Al
          </button>
        </div>

        {/* Message Input */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Mesaj yaz..."
            className="flex-1 px-4 py-2 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-full"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop: Featured Product */}
      <div className="hidden md:block fixed bottom-4 right-4 w-80 bg-white rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            <ImageWithFallback 
              src={MOCK_FEATURED_PRODUCT.image} 
              alt={MOCK_FEATURED_PRODUCT.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full inline-block mb-2">
              Şu An Satışta
            </div>
            <h4 className="text-gray-900 line-clamp-2 mb-1">
              {MOCK_FEATURED_PRODUCT.title}
            </h4>
            <p className="text-purple-600">₺{MOCK_FEATURED_PRODUCT.price.toLocaleString()}</p>
          </div>
        </div>

        <button
          onClick={handleBuyNow}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          Hemen Satın Al
        </button>

        <button
          onClick={() => setShowProducts(true)}
          className="w-full mt-2 bg-gray-100 text-gray-900 py-3 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Tüm Koleksiyonu Gör ({MOCK_COLLECTION_PRODUCTS.length + 1} ürün)
        </button>
      </div>

      {/* Products Modal */}
      {showProducts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900">Koleksiyondaki Ürünler</h3>
                <button
                  onClick={() => setShowProducts(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-2 gap-4">
                {[MOCK_FEATURED_PRODUCT, ...MOCK_COLLECTION_PRODUCTS].map(product => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                    <div className="aspect-square bg-gray-100">
                      <ImageWithFallback 
                        src={product.image} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="text-gray-900 text-sm line-clamp-2 mb-2">{product.title}</h4>
                      <p className="text-purple-600 mb-3">₺{product.price.toLocaleString()}</p>
                      <button
                        onClick={() => navigate(`/checkout/${product.id}`)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg text-sm hover:shadow-lg transition-all"
                      >
                        Satın Al
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
