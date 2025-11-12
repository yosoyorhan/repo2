import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Package, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';

const StartStreamPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingStream, setIsCreatingStream] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchCollections();
  }, [user]);

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          collection_products(
            product_id,
            products(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({ title: 'Koleksiyonlar yüklenemedi', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const startStreamWithCollection = async () => {
    if (!selectedCollection) {
      toast({ title: 'Lütfen bir koleksiyon seçin', variant: 'destructive' });
      return;
    }

    setIsCreatingStream(true);
    try {
      const { data: stream, error } = await supabase
        .from('streams')
        .insert({
          user_id: user.id,
          title: `${selectedCollection.name} - Canlı Satış`,
          status: 'inactive',
          orientation: 'landscape'
        })
        .select()
        .single();

      if (error) throw error;

      // Koleksiyon ID'sini stream ile ilişkilendirmek için streams tablosuna collection_id eklenebilir
      // veya LiveStream component'i içinde selectedCollection state'i kullanılabilir
      // Şimdilik navigate ile collection bilgisini state olarak gönderelim
      
      navigate(`/stream/${stream.id}`, { 
        state: { 
          collectionId: selectedCollection.id,
          collectionName: selectedCollection.name 
        } 
      });
    } catch (error) {
      console.error('Error creating stream:', error);
      toast({ title: 'Yayın oluşturulamadı', description: error.message, variant: 'destructive' });
    } finally {
      setIsCreatingStream(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbfaff] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaff]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a1333] mb-2">Canlı Yayın Başlat</h1>
          <p className="text-[#4a4475]">Satmak istediğiniz koleksiyonu seçin ve canlı yayına başlayın</p>
        </div>

        {collections.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1a1333] mb-2">Henüz koleksiyon yok</h3>
            <p className="text-[#4a4475] mb-6">Canlı yayın başlatmak için önce bir koleksiyon oluşturun</p>
            <Button 
              onClick={() => navigate('/profile?tab=collections')}
              className="rounded-full"
            >
              Koleksiyon Oluştur
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
            {/* Left: Collection List */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit lg:sticky lg:top-6">
              <h2 className="text-lg font-bold text-[#1a1333] mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                Koleksiyonlarım
              </h2>
              <div className="space-y-3">
                {collections.map((collection) => {
                  const productCount = collection.collection_products?.length || 0;
                  const isSelected = selectedCollection?.id === collection.id;
                  
                  return (
                    <motion.div
                      key={collection.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCollection(collection)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-400 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-[#1a1333]">{collection.name}</h3>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {collection.description && (
                        <p className="text-xs text-[#4a4475] mb-2 line-clamp-2">{collection.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#4a4475]">{productCount} ürün</span>
                        <ChevronRight className={`h-4 w-4 transition-colors ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {selectedCollection && (
                <Button
                  onClick={startStreamWithCollection}
                  disabled={isCreatingStream}
                  className="w-full mt-6 rounded-full py-6 text-base font-semibold"
                  size="lg"
                >
                  {isCreatingStream ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Yayın Başlatılıyor...
                    </>
                  ) : (
                    <>
                      <Video className="h-5 w-5 mr-2" />
                      Canlı Yayını Başlat
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Right: Selected Collection Products Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {selectedCollection ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[#1a1333] mb-2">{selectedCollection.name}</h2>
                    {selectedCollection.description && (
                      <p className="text-[#4a4475]">{selectedCollection.description}</p>
                    )}
                  </div>

                  {selectedCollection.collection_products && selectedCollection.collection_products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {selectedCollection.collection_products.map((cp) => {
                        const product = cp.products;
                        if (!product) return null;
                        
                        return (
                          <div
                            key={product.id}
                            className="border border-gray-200 rounded-lg overflow-hidden hover:border-purple-400 transition-colors"
                          >
                            {product.image_url ? (
                              <div className="aspect-video bg-gray-100 overflow-hidden">
                                <img 
                                  src={product.image_url} 
                                  alt={product.title} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                <Package className="h-12 w-12 text-purple-300" />
                              </div>
                            )}
                            <div className="p-3">
                              <h4 className="font-semibold text-sm text-[#1a1333] line-clamp-2 mb-1">{product.title}</h4>
                              {product.description && (
                                <p className="text-xs text-[#4a4475] line-clamp-2 mb-2">{product.description}</p>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-purple-600 font-bold">₺{Number(product.price).toFixed(2)}</span>
                                {product.is_sold && (
                                  <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 font-medium">Satıldı</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-[#4a4475]">Bu koleksiyonda henüz ürün yok</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4">
                    <Package className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1a1333] mb-2">Koleksiyon Seçin</h3>
                  <p className="text-[#4a4475]">Sol taraftan bir koleksiyon seçerek başlayın</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartStreamPage;
