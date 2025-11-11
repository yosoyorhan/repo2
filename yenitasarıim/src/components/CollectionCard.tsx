import { Folder, TrendingUp } from 'lucide-react';

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    itemCount: number;
    thumbnail: string;
    totalValue: number;
  };
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
        <img 
          src={collection.thumbnail} 
          alt={collection.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2 text-white mb-1">
            <Folder className="w-4 h-4" />
            <span className="text-sm">{collection.itemCount} Ürün</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-gray-900 mb-2">{collection.name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-purple-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">₺{collection.totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
