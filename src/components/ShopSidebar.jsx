import React from 'react';
import { Search, Filter, ArrowUpDown, Gavel, Gift, Package } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ShopSidebar = () => {
  const { toast } = useToast();

  const handleFeatureClick = () => {
    toast({
      title: "🚧 Bu özellik henüz hazır değil!",
      description: "Bir sonraki promptunda isteyebilirsin! 🚀",
    });
  };

  const products = [
    { id: 1, name: 'Vintage Watch', price: '$299', image: 'Luxury vintage wristwatch with leather strap' },
    { id: 2, name: 'Designer Bag', price: '$450', image: 'Premium leather designer handbag' },
    { id: 3, name: 'Sneakers', price: '$180', image: 'Limited edition athletic sneakers' },
  ];

  return (
    <div className="bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Shop</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full h-10 pl-10 pr-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#FFDE59] transition-all"
            onClick={handleFeatureClick}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleFeatureClick}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter</span>
          </button>
          <button 
            onClick={handleFeatureClick}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="text-sm">Sort</span>
          </button>
          <button 
            onClick={handleFeatureClick}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
          >
            <Gavel className="w-4 h-4" />
            <span className="text-sm">Auction</span>
          </button>
          <button 
            onClick={handleFeatureClick}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
          >
            <Gift className="w-4 h-4" />
            <span className="text-sm">Giveaway</span>
          </button>
          <button 
            onClick={handleFeatureClick}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
          >
            <Package className="w-4 h-4" />
            <span className="text-sm">Sold</span>
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Products (1)</h3>
          {products.map((product) => (
            <div
              key={product.id}
              onClick={handleFeatureClick}
              className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#FFDE59] transition-all cursor-pointer"
            >
              <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
                <img alt={product.name} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1635865165118-917ed9e20936" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-600">{product.price}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Upcoming Giveaways (7)</h3>
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                onClick={handleFeatureClick}
                className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#FFDE59] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#FFDE59]" />
                  <span className="text-sm text-gray-700">Giveaway #{item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSidebar;