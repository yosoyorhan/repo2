import React, { useState, useRef } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function ProductPopup({ onClose, onProductAdded }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile || !user) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: 'Giriş yapmalısınız', variant: 'destructive' });
      return;
    }

    if (!title.trim()) {
      toast({ title: 'Ürün başlığı gerekli', variant: 'destructive' });
      return;
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      toast({ title: 'Geçerli bir fiyat girin', variant: 'destructive' });
      return;
    }

    try {
      setIsSaving(true);
      setIsUploading(true);

      // Upload image first if exists
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      setIsUploading(false);

      // Insert product
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          price: priceNumber,
          image_url: imageUrl
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: '✅ Ürün eklendi', description: 'Ürün başarıyla kaydedildi' });
      
      // Call parent callback
      if (onProductAdded) {
        onProductAdded(data);
      }

      // Reset form
      setImage(null);
      setImageFile(null);
      setTitle('');
      setDescription('');
      setPrice('');
      
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ 
        title: 'Ürün kaydedilemedi', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleSaveAndAddAnother = async () => {
    if (!user) {
      toast({ title: 'Giriş yapmalısınız', variant: 'destructive' });
      return;
    }

    if (!title.trim()) {
      toast({ title: 'Ürün başlığı gerekli', variant: 'destructive' });
      return;
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      toast({ title: 'Geçerli bir fiyat girin', variant: 'destructive' });
      return;
    }

    try {
      setIsSaving(true);
      setIsUploading(true);

      // Upload image first if exists
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      setIsUploading(false);

      // Insert product
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          price: priceNumber,
          image_url: imageUrl
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: '✅ Ürün eklendi', description: 'Yeni ürün ekleyebilirsin' });
      
      // Call parent callback
      if (onProductAdded) {
        onProductAdded(data);
      }

      // Reset form but keep popup open
      setImage(null);
      setImageFile(null);
      setTitle('');
      setDescription('');
      setPrice('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ 
        title: 'Ürün kaydedilemedi', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white/40 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-2xl p-6 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 transition disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Yeni Ürün Ekle
        </h2>

        {/* Image Upload */}
        <div className="flex flex-col sm:flex-row gap-5">
          <label className="relative group flex items-center justify-center w-full sm:w-1/2 aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-violet-500 transition-all cursor-pointer bg-white/60 overflow-hidden">
            {image ? (
              <>
                <img
                  src={image}
                  alt="Ürün Görseli"
                  className="w-full h-full object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm">Görsel yükle</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isSaving}
            />
          </label>

          {/* Form Fields */}
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Ürün Başlığı
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Yazlık Elbise"
                className="w-full rounded-xl border border-white/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-violet-400 focus:outline-none transition-all"
                disabled={isSaving}
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Açıklama
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kısa ürün açıklaması..."
                className="w-full rounded-xl border border-white/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-violet-400 focus:outline-none transition-all resize-none"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Fiyat (₺)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-white/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-violet-400 focus:outline-none transition-all"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl border border-white/40 bg-white/40 text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            İptal
          </button>
          <button 
            onClick={handleSaveAndAddAnother}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Kaydediliyor...
              </span>
            ) : (
              'Kaydet ve Yeni Ekle'
            )}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Kaydediliyor...
              </span>
            ) : (
              'Kaydet'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
