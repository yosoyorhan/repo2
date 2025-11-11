import React, { useState, useRef } from 'react';
import { X, ImagePlus, Layers, DollarSign, Type, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const CATEGORIES = {
  'Trading Card Games': [
    'Pokémon', 'Yu-Gi-Oh!', 'Magic: The Gathering', 'Disney Lorcana',
    'One Piece Card Game', 'Dragon Ball Super', 'Flesh and Blood',
    'Cardfight!! Vanguard', 'Weiss Schwarz', 'Final Fantasy TCG',
    'Digimon Card Game', 'Star Wars: Unlimited', 'MetaZoo',
    'Keyforge', 'Legend of the Five Rings', 'VS System 2PCG',
    'Warhammer 40K', 'Bandai One Piece', 'Union Arena', 'Other TCG'
  ],
  'Sports Cards & Memorabilia': [
    'Basketball', 'Football', 'Baseball', 'Soccer', 'Hockey',
    'UFC/MMA', 'Wrestling', 'Racing', 'Golf', 'Multi-Sport',
    'Autographs', 'Jerseys', 'Other Sports'
  ],
  'Fashion & Apparel': [
    "Women's Clothing", "Men's Clothing", 'Sneakers & Athletic Shoes',
    'Luxury Bags & Accessories', 'Vintage Fashion', 'Streetwear',
    'Designer Clothing', 'Boots & Casual Shoes', 'Kids Fashion'
  ],
  'Jewelry & Watches': [
    'Fine Jewelry', 'Fashion Jewelry', 'Luxury Watches', 'Vintage Watches',
    'Smart Watches', 'Costume Jewelry', 'Gemstones', 'Custom Jewelry'
  ],
  'Toys & Hobbies': [
    'Action Figures', 'LEGO', 'Funko Pop', 'Model Kits', 'RC Vehicles',
    'Trading Card Supplies', 'Vintage Toys', 'Diecast Models',
    'Building Sets', 'Collectible Figures'
  ],
  'Electronics & Gaming': [
    'Video Games', 'Consoles', 'Gaming Accessories', 'Computers',
    'Smartphones & Tablets', 'Audio Equipment', 'Cameras',
    'Smart Home', 'Retro Gaming', 'PC Components'
  ],
  'Comics, Manga & Books': [
    'Marvel Comics', 'DC Comics', 'Independent Comics', 'Manga',
    'Graphic Novels', 'Vintage Comics', 'Graded Comics',
    'Light Novels', 'Art Books', 'Rare Books'
  ],
  'Home & Garden': [
    'Furniture', 'Home Decor', 'Kitchen & Dining', 'Bedding & Bath',
    'Storage & Organization', 'Lighting', 'Garden Tools',
    'Outdoor Furniture', 'Plants & Planters'
  ],
  'Arts & Handmade': [
    'Original Art', 'Prints & Posters', 'Sculptures', 'Ceramics & Pottery',
    'Handmade Jewelry', 'Textiles & Fiber Arts', 'Photography',
    'Mixed Media', 'Digital Art', 'Art Supplies'
  ],
  'Beauty & Personal Care': [
    'Makeup', 'Skincare', 'Haircare', 'Fragrances', 'Nail Care',
    'Bath & Body', 'Beauty Tools', 'Korean Beauty', 'Luxury Beauty'
  ],
  'Food & Beverages': [
    'Gourmet Foods', 'Specialty Snacks', 'Coffee & Tea', 'Wine & Spirits',
    'Craft Beer', 'Artisan Foods', 'International Foods',
    'Baking Supplies', 'Health Foods'
  ],
  'Coins & Currency': [
    'US Coins', 'World Coins', 'Ancient Coins', 'Paper Money',
    'Bullion', 'Tokens & Medals', 'Rare Currency', 'Coin Supplies'
  ],
  'Estate Sales & Wholesale': [
    'Estate Jewelry', 'Antique Furniture', 'Vintage Items',
    'Bulk Lots', 'Liquidation', 'Mixed Lots', 'Wholesale Goods'
  ],
  'Outdoor & Sporting Goods': [
    'Camping & Hiking', 'Fishing', 'Hunting', 'Cycling',
    'Water Sports', 'Winter Sports', 'Fitness Equipment',
    'Team Sports', 'Golf Equipment'
  ],
  'Baby, Kids & Pets': [
    'Baby Gear', 'Kids Toys', 'Baby Clothing', 'Pet Supplies',
    'Pet Toys', 'Board Games', 'Puzzles', 'Educational Toys',
    'Nursery Decor', 'Pet Accessories'
  ]
};

export default function ProductPopup({ onClose, onProductAdded }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedMainCategory = category.split(' > ')[0];
  const availableSubcategories = selectedMainCategory ? CATEGORIES[selectedMainCategory] || [] : [];  const handleImageChange = (e) => {
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
          category: category.trim() || null,
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
      setCategory('');
      
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
          category: category || null,
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
      setCategory('');
      setSubcategory('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-100/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white border border-blue-100 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-blue-100 bg-blue-50">
          <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
            Yeni Ürün Ekle
          </h2>
          <button 
            onClick={onClose} 
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Left side: Image */}
          <label className="group relative flex items-center justify-center aspect-square w-full rounded-2xl bg-blue-50 border border-dashed border-blue-200 hover:border-orange-300 transition cursor-pointer overflow-hidden">
            {image ? (
              <>
                <img src={image} alt="preview" className="object-cover w-full h-full" />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-blue-400">
                <ImagePlus className="w-10 h-10 mb-2" />
                <p className="text-sm font-medium">Ürün görseli ekle</p>
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

          {/* Right side: Inputs */}
          <div className="flex flex-col gap-5">
            <div className="relative">
              <Type className="absolute left-3 top-3.5 w-4 h-4 text-blue-400" />
              <input
                type="text"
                placeholder="Ürün Adı"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-9 pr-3 py-3 rounded-xl bg-white border border-blue-200 text-[15px] focus:ring-2 focus:ring-orange-400 focus:outline-none"
                disabled={isSaving}
                autoFocus
              />
            </div>

            <div className="relative">
              <Layers className="absolute left-3 top-3.5 w-4 h-4 text-blue-400 z-10 pointer-events-none" />
              <select
                value={selectedMainCategory}
                onChange={(e) => {
                  const main = e.target.value;
                  setCategory(main);
                  setSubcategory('');
                }}
                className="w-full pl-9 pr-10 py-3 rounded-xl bg-white border border-blue-200 text-[15px] focus:ring-2 focus:ring-orange-400 focus:outline-none appearance-none cursor-pointer"
                disabled={isSaving}
              >
                <option value="">Ana Kategori Seçin</option>
                {Object.keys(CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-blue-400 pointer-events-none" />
            </div>

            {selectedMainCategory && (
              <div className="relative">
                <Layers className="absolute left-3 top-3.5 w-4 h-4 text-orange-400 z-10 pointer-events-none" />
                <select
                  value={subcategory}
                  onChange={(e) => {
                    const sub = e.target.value;
                    setSubcategory(sub);
                    setCategory(`${selectedMainCategory} > ${sub}`);
                  }}
                  className="w-full pl-9 pr-10 py-3 rounded-xl bg-white border border-orange-200 text-[15px] focus:ring-2 focus:ring-orange-400 focus:outline-none appearance-none cursor-pointer"
                  disabled={isSaving}
                >
                  <option value="">Alt Kategori Seçin</option>
                  {availableSubcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-orange-400 pointer-events-none" />
              </div>
            )}

            <div className="relative">
              <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-blue-400" />
              <input
                type="number"
                step="0.01"
                placeholder="Fiyat (₺)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-9 pr-3 py-3 rounded-xl bg-white border border-blue-200 text-[15px] focus:ring-2 focus:ring-orange-400 focus:outline-none"
                disabled={isSaving}
              />
            </div>

            <textarea
              placeholder="Ürün açıklaması (malzeme, boyut, kullanım vb.)"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-white border border-blue-200 px-3 py-3 text-[15px] focus:ring-2 focus:ring-orange-400 focus:outline-none resize-none"
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-8 py-5 border-t border-blue-100 bg-blue-50">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-[15px] rounded-xl text-gray-600 hover:bg-blue-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            İptal
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 text-[15px] font-semibold rounded-xl bg-blue-500 hover:bg-orange-400 text-white shadow-md hover:shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
