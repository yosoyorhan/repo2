import { Search, TrendingUp, Flame } from 'lucide-react';
import { LiveStreamCard } from './LiveStreamCard';
import { useState } from 'react';

const MOCK_STREAMS = [
  {
    id: '1',
    title: 'Nadir Pokemon Kartları Açılımı! 🔥',
    seller: {
      name: 'Kart Dünyası',
      username: 'kartdunyasi',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kartdunyasi'
    },
    thumbnail: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=400',
    viewers: 1247,
    category: 'Koleksiyon'
  },
  {
    id: '2',
    title: 'Yaz Sezonuna Özel Kıyafet Koleksiyonu ☀️',
    seller: {
      name: 'Moda Atölyesi',
      username: 'modatolyesi',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=modatolyesi'
    },
    thumbnail: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    viewers: 856,
    category: 'Moda'
  },
  {
    id: '3',
    title: 'Vintage Ayakkabı Şovu - İndirimli!',
    seller: {
      name: 'Sneaker Kollektör',
      username: 'sneakerkollektor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneaker'
    },
    thumbnail: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400',
    viewers: 634,
    category: 'Ayakkabı'
  },
  {
    id: '4',
    title: 'El Yapımı Takılar - Canlı Üretim',
    seller: {
      name: 'Zümrüt Atölye',
      username: 'zumruatolye',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zumrut'
    },
    thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    viewers: 423,
    category: 'El Sanatları'
  },
  {
    id: '5',
    title: 'Gaming Setup İncelemeleri 🎮',
    seller: {
      name: 'Tech Master',
      username: 'techmaster',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech'
    },
    thumbnail: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
    viewers: 2103,
    category: 'Teknoloji'
  },
  {
    id: '6',
    title: 'Antika Kitap Müzayedesi 📚',
    seller: {
      name: 'Kitap Koleksiyoncusu',
      username: 'kitapkoleksiyonu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kitap'
    },
    thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    viewers: 312,
    category: 'Koleksiyon'
  }
];

const CATEGORIES = ['Tümü', 'Koleksiyon', 'Moda', 'Teknoloji', 'El Sanatları', 'Ayakkabı'];

export function HomePage({ currentUser }: { currentUser: any }) {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStreams = MOCK_STREAMS.filter(stream => {
    const matchesCategory = selectedCategory === 'Tümü' || stream.category === selectedCategory;
    const matchesSearch = stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          stream.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Livenner
            </h1>
            <div className="flex items-center gap-3">
              <button className="relative">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full border-2 border-purple-400"
                />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Yayın veya satıcı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Trending Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-6 h-6 text-orange-500" />
            <h2 className="text-gray-900">Popüler Yayınlar</h2>
          </div>
        </div>

        {/* Live Streams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStreams.map(stream => (
            <LiveStreamCard key={stream.id} stream={stream} />
          ))}
        </div>

        {filteredStreams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aradığınız kriterlere uygun yayın bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
