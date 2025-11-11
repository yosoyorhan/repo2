import { ArrowLeft, Video, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const MOCK_COLLECTIONS = [
  {
    id: '1',
    name: 'Nadir Kartlar Koleksiyonu',
    itemCount: 24,
    thumbnail: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=300'
  },
  {
    id: '2',
    name: 'Yaz Sezonu Özel',
    itemCount: 12,
    thumbnail: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=300'
  },
  {
    id: '3',
    name: 'Vintage Pokemon',
    itemCount: 18,
    thumbnail: 'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=300'
  }
];

export function StartStream({ currentUser }: { currentUser: any }) {
  const navigate = useNavigate();
  const [showCollectionSelector, setShowCollectionSelector] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [streamTitle, setStreamTitle] = useState('');

  const handleStartStream = () => {
    if (selectedCollection) {
      // In a real app, this would initialize the streaming
      navigate('/stream/new/host');
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-gray-900">Yayın Başlat</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Camera Preview */}
        <div className="bg-black rounded-2xl aspect-video mb-6 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
            <div className="text-center">
              <Video className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70">Kamera Önizlemesi</p>
            </div>
          </div>
          
          {/* Camera controls would go here in a real app */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
            <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full">
              Kamera Değiştir
            </button>
            <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full">
              Mikrofon
            </button>
          </div>
        </div>

        {/* Stream Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h2 className="text-gray-900 mb-4">Yayın Ayarları</h2>
          
          <div className="space-y-4">
            {/* Stream Title */}
            <div>
              <label className="block text-gray-700 mb-2">Yayın Başlığı</label>
              <input
                type="text"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="Yayınınıza bir başlık verin..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Selected Collection */}
            <div>
              <label className="block text-gray-700 mb-2">Satılacak Koleksiyon *</label>
              {selectedCollection ? (
                <div className="flex items-center gap-3 p-4 bg-purple-50 border-2 border-purple-400 rounded-xl">
                  <img 
                    src={selectedCollection.thumbnail} 
                    alt={selectedCollection.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-gray-900">{selectedCollection.name}</p>
                    <p className="text-gray-500 text-sm">{selectedCollection.itemCount} ürün</p>
                  </div>
                  <button
                    onClick={() => setSelectedCollection(null)}
                    className="p-2 hover:bg-white rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCollectionSelector(true)}
                  className="w-full py-4 px-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 transition-colors text-gray-500 hover:text-purple-600"
                >
                  Koleksiyon Seç
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Start Stream Button */}
        <button
          onClick={handleStartStream}
          disabled={!selectedCollection}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Video className="w-6 h-6" />
          <span>Yayını Direkt Başlat</span>
        </button>

        <p className="text-center text-gray-500 text-sm mt-4">
          Yayını başlattığınızda, seçtiğiniz koleksiyondaki ürünler yayında görünür olacak
        </p>
      </div>

      {/* Collection Selector Modal */}
      {showCollectionSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900">Koleksiyon Seç</h3>
                <button
                  onClick={() => setShowCollectionSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Hangi koleksiyonu yayında satmak istiyorsunuz?
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="space-y-3">
                {MOCK_COLLECTIONS.map(collection => (
                  <button
                    key={collection.id}
                    onClick={() => {
                      setSelectedCollection(collection);
                      setShowCollectionSelector(false);
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-purple-50 rounded-xl transition-colors group"
                  >
                    <img 
                      src={collection.thumbnail} 
                      alt={collection.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-gray-900 group-hover:text-purple-600 transition-colors">
                        {collection.name}
                      </p>
                      <p className="text-gray-500 text-sm">{collection.itemCount} ürün içeriyor</p>
                    </div>
                  </button>
                ))}
              </div>

              {MOCK_COLLECTIONS.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Henüz koleksiyonunuz yok</p>
                  <button
                    onClick={() => {
                      setShowCollectionSelector(false);
                      navigate('/collections/manage');
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-6 rounded-full hover:shadow-lg transition-all"
                  >
                    Koleksiyon Oluştur
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
