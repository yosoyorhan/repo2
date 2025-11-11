import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    image: string;
    inStock: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-square overflow-hidden bg-gray-200">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm">Tükendi</span>
          </div>
        )}
        
        <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <ShoppingBag className="w-5 h-5 text-purple-600" />
        </button>
      </div>
      
      <div className="p-3">
        <h4 className="text-gray-900 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.title}
        </h4>
        <p className="text-purple-600">₺{product.price.toLocaleString()}</p>
      </div>
    </div>
  );
}
