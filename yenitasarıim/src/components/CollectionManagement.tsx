import { ArrowLeft, Plus, X, Save, Trash2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const MOCK_INVENTORY = [
  {
    id: '1',
    title: 'Charizard GX Pokemon Kartı',
    price: 450,
    image: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=300'
  },
  {
    id: '2',
    title: 'Pikachu VMAX Holo',
    price: 280,
    image: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=300'
  },
  {
    id: '3',
    title: 'Magic Black Lotus Repro',
    price: 120,
    image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=300'
  },
  {
    id: '4',
    title: 'Rare Holographic Set',
    price: 750,
    image: 'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=300'
  }
];

export function CollectionManagement({ currentUser }: { currentUser: any }) {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([
    {
      id: '1',
      name: 'Nadir Kartlar Koleksiyonu',
      productIds: ['1', '4']
    }
  ]);
  
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingCollection, setEditingCollection] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      const newCollection = {
        id: Date.now().toString(),
        name: newCollectionName,
        productIds: selectedProducts
      };
      setCollections([...collections, newCollection]);
      setNewCollectionName('');
      setSelectedProducts([]);
      setIsCreatingNew(false);
    }
  };

  const handleDeleteCollection = (id: string) => {
    setCollections(collections.filter(c => c.id !== id));
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getCollectionProducts = (productIds: string[]) => {
    return MOCK_INVENTORY.filter(p => productIds.includes(p.id));
  };

  const startEditingCollection = (collection: any) => {
    setEditingCollection(collection.id);
    setSelectedProducts(collection.productIds);
    setShowProductSelector(true);
  };

  const saveCollectionEdit = () => {
    if (editingCollection) {
      setCollections(collections.map(c =>
        c.id === editingCollection
          ? { ...c, productIds: selectedProducts }
          : c
      ));
      setEditingCollection(null);
      setSelectedProducts([]);
      setShowProductSelector(false);
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
              <h1 className="text-gray-900">Koleksiyon Yönetimi</h1>
            </div>
            <button 
              onClick={() => setIsCreatingNew(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-full hover:shadow-lg transition-all"
            >
              + Yeni Koleksiyon
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Create New Collection */}
        {isCreatingNew && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">Yeni Koleksiyon Oluştur</h2>
              <button 
                onClick={() => {
                  setIsCreatingNew(false);
                  setNewCollectionName('');
                  setSelectedProducts([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Collection Name */}
              <div>
                <label className="block text-gray-700 mb-2">Koleksiyon Adı *</label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Örn: Yaz Sezonu Koleksiyonu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Add Products Button */}
              <div>
                <button
                  onClick={() => setShowProductSelector(!showProductSelector)}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-between"
                >
                  <span>Ürün Ekle ({selectedProducts.length} seçili)</span>
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Product Selector */}
              {showProductSelector && (
                <div className="border border-gray-200 rounded-xl p-4 max-h-96 overflow-y-auto">
                  <p className="text-gray-700 mb-3">Envanterdeki Ürünler</p>
                  <div className="space-y-2">
                    {MOCK_INVENTORY.map(product => (
                      <div
                        key={product.id}
                        onClick={() => toggleProductSelection(product.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedProducts.includes(product.id)
                            ? 'bg-purple-50 border-2 border-purple-400'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <ImageWithFallback 
                            src={product.image} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-sm truncate">{product.title}</p>
                          <p className="text-purple-600 text-sm">₺{product.price}</p>
                        </div>
                        {selectedProducts.includes(product.id) && (
                          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                Koleksiyonu Oluştur
              </button>
            </div>
          </div>
        )}

        {/* Collections List */}
        <div className="space-y-4">
          <h3 className="text-gray-900">Mevcut Koleksiyonlar ({collections.length})</h3>
          
          {collections.map(collection => {
            const collectionProducts = getCollectionProducts(collection.productIds);
            const isEditing = editingCollection === collection.id;
            
            return (
              <div key={collection.id} className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-gray-900 mb-1">{collection.name}</h4>
                    <p className="text-gray-500 text-sm">{collection.productIds.length} ürün</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <>
                        <button
                          onClick={() => startEditingCollection(collection)}
                          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDeleteCollection(collection.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={saveCollectionEdit}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={() => {
                            setEditingCollection(null);
                            setSelectedProducts([]);
                            setShowProductSelector(false);
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          İptal
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Product Selector when Editing */}
                {isEditing && showProductSelector && (
                  <div className="border border-gray-200 rounded-xl p-4 mb-4 max-h-64 overflow-y-auto">
                    <p className="text-gray-700 mb-3 text-sm">Ürün Seç</p>
                    <div className="space-y-2">
                      {MOCK_INVENTORY.map(product => (
                        <div
                          key={product.id}
                          onClick={() => toggleProductSelection(product.id)}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedProducts.includes(product.id)
                              ? 'bg-purple-50 border-2 border-purple-400'
                              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            <ImageWithFallback 
                              src={product.image} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 text-sm truncate">{product.title}</p>
                            <p className="text-purple-600 text-xs">₺{product.price}</p>
                          </div>
                          {selectedProducts.includes(product.id) && (
                            <Check className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products Grid */}
                {collectionProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {collectionProducts.map(product => (
                      <div key={product.id} className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="aspect-square bg-gray-200">
                          <ImageWithFallback 
                            src={product.image} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-gray-900 text-xs truncate">{product.title}</p>
                          <p className="text-purple-600 text-xs">₺{product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">Bu koleksiyonda henüz ürün yok</p>
                  </div>
                )}
              </div>
            );
          })}
          
          {collections.length === 0 && !isCreatingNew && (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500 mb-4">Henüz koleksiyon oluşturmadınız</p>
              <button 
                onClick={() => setIsCreatingNew(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-6 rounded-full hover:shadow-lg transition-all"
              >
                İlk Koleksiyonu Oluştur
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
