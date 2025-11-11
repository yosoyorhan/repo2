import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, MoreVertical, Package, Folder, Video, Info, Plus, Settings } from 'lucide-react';
import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { CollectionCard } from './CollectionCard';

const MOCK_SELLER = {
  id: '1',
  name: 'Kart Dünyası',
  username: 'kartdunyasi',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kartdunyasi',
  bio: 'Pokemon ve Magic kartlarında uzman koleksiyoncu. Her hafta canlı açılımlar! 🎴✨',
  followers: 12400,
  following: 342,
  totalSales: 856,
  isVerified: true
};

const MOCK_PRODUCTS = [
  {
    id: '1',
    title: 'Charizard GX Pokemon Kartı',
    price: 450,
    image: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=300',
    inStock: true
  },
  {
    id: '2',
    title: 'Pikachu VMAX Holo',
    price: 280,
    image: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=300',
    inStock: true
  },
  {
    id: '3',
    title: 'Magic Black Lotus Repro',
    price: 120,
    image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=300',
    inStock: false
  },
  {
    id: '4',
    title: 'Rare Holographic Set',
    price: 750,
    image: 'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=300',
    inStock: true
  }
];

const MOCK_COLLECTIONS = [
  {
    id: '1',
    name: 'Nadir Kartlar Koleksiyonu',
    itemCount: 24,
    thumbnail: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=300',
    totalValue: 12400
  },
  {
    id: '2',
    name: 'Yaz Sezonu Özel',
    itemCount: 12,
    thumbnail: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=300',
    totalValue: 3200
  },
  {
    id: '3',
    name: 'Vintage Pokemon',
    itemCount: 18,
    thumbnail: 'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=300',
    totalValue: 8900
  }
];

export function SellerProfile({ currentUser }: { currentUser: any }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'collections' | 'archive' | 'about'>('products');
  const isOwnProfile = currentUser.username === username;

  const tabs = [
    { id: 'products', label: 'Ürünler', icon: Package },
    { id: 'collections', label: 'Koleksiyonlar', icon: Folder },
    { id: 'archive', label: 'Arşiv', icon: Video },
    { id: 'about', label: 'Hakkında', icon: Info }
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="text-gray-900">{MOCK_SELLER.name}</span>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              {isOwnProfile && (
                <button 
                  onClick={() => navigate('/products/manage')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Profile Info */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <img 
                src={MOCK_SELLER.avatar} 
                alt={MOCK_SELLER.name}
                className="w-20 h-20 rounded-full border-4 border-purple-200"
              />
              {MOCK_SELLER.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-gray-900 mb-1">{MOCK_SELLER.name}</h2>
              <p className="text-gray-500 mb-3">@{MOCK_SELLER.username}</p>
              
              <div className="flex items-center gap-4 mb-3">
                <div>
                  <span className="text-gray-900 mr-1">{MOCK_SELLER.followers.toLocaleString()}</span>
                  <span className="text-gray-500 text-sm">Takipçi</span>
                </div>
                <div>
                  <span className="text-gray-900 mr-1">{MOCK_SELLER.following}</span>
                  <span className="text-gray-500 text-sm">Takip</span>
                </div>
                <div>
                  <span className="text-gray-900 mr-1">{MOCK_SELLER.totalSales}</span>
                  <span className="text-gray-500 text-sm">Satış</span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{MOCK_SELLER.bio}</p>
              
              {!isOwnProfile && (
                <div className="flex gap-2">
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-6 rounded-full hover:shadow-lg transition-all">
                    Takip Et
                  </button>
                  <button className="px-6 py-2 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-colors">
                    Mesaj
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-4 px-4 transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && (
          <div>
            {isOwnProfile && (
              <div className="mb-6">
                <button 
                  onClick={() => navigate('/products/manage')}
                  className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Ürün Ekle
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {MOCK_PRODUCTS.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'collections' && (
          <div>
            {isOwnProfile && (
              <div className="mb-6">
                <button 
                  onClick={() => navigate('/collections/manage')}
                  className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Koleksiyon Oluştur
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_COLLECTIONS.map(collection => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Henüz arşivlenmiş yayın yok</p>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-gray-900 mb-4">Hakkında</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">Açıklama</p>
                <p className="text-gray-700">{MOCK_SELLER.bio}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Toplam Satış</p>
                <p className="text-gray-900">{MOCK_SELLER.totalSales} ürün</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Üyelik Tarihi</p>
                <p className="text-gray-900">Ocak 2024</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
