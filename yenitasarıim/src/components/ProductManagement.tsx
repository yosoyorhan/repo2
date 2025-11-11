import { ArrowLeft, Upload, X, Save, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ProductManagement({ currentUser }: { currentUser: any }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([
    {
      id: '1',
      title: 'Charizard GX Pokemon Kartı',
      description: 'Nadir holografik kart, mükemmel durumda',
      price: 450,
      image: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=300',
      inStock: true
    }
  ]);
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
    inStock: true
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to a server
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = () => {
    if (newProduct.title && newProduct.price) {
      const product = {
        id: Date.now().toString(),
        ...newProduct,
        price: parseFloat(newProduct.price)
      };
      setProducts([...products, product]);
      setNewProduct({ title: '', description: '', price: '', image: '', inStock: true });
      setIsAddingNew(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
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
              <h1 className="text-gray-900">Ürün Yönetimi</h1>
            </div>
            <button 
              onClick={() => setIsAddingNew(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-full hover:shadow-lg transition-all"
            >
              + Yeni Ürün
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Add New Product Form */}
        {isAddingNew && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">Yeni Ürün Ekle</h2>
              <button 
                onClick={() => {
                  setIsAddingNew(false);
                  setNewProduct({ title: '', description: '', price: '', image: '', inStock: true });
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 mb-2">Ürün Görseli</label>
                {newProduct.image ? (
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2">
                    <ImageWithFallback 
                      src={newProduct.image} 
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setNewProduct({ ...newProduct, image: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 transition-colors bg-gray-50">
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-gray-500">Görsel Yükle</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-gray-700 mb-2">Ürün Başlığı *</label>
                <input
                  type="text"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  placeholder="Örn: Charizard GX Pokemon Kartı"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 mb-2">Açıklama</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Ürün hakkında detaylı bilgi..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-gray-700 mb-2">Fiyat (₺) *</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* In Stock Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Stokta Var</span>
                <button
                  onClick={() => setNewProduct({ ...newProduct, inStock: !newProduct.inStock })}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    newProduct.inStock ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    newProduct.inStock ? 'translate-x-6' : ''
                  }`} />
                </button>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveProduct}
                disabled={!newProduct.title || !newProduct.price}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                Ürünü Kaydet
              </button>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="space-y-4">
          <h3 className="text-gray-900">Mevcut Ürünler ({products.length})</h3>
          
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-xl p-4 shadow-md flex gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <ImageWithFallback 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-gray-900 mb-1">{product.title}</h4>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-4">
                  <span className="text-purple-600">₺{product.price.toLocaleString()}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.inStock ? 'Stokta' : 'Tükendi'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => handleDeleteProduct(product.id)}
                className="p-2 hover:bg-red-50 rounded-full transition-colors self-start"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>
          ))}
          
          {products.length === 0 && !isAddingNew && (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500 mb-4">Henüz ürün eklemediniz</p>
              <button 
                onClick={() => setIsAddingNew(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-6 rounded-full hover:shadow-lg transition-all"
              >
                İlk Ürünü Ekle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
