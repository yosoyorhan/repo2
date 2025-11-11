import { Eye, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LiveStreamCardProps {
  stream: {
    id: string;
    title: string;
    seller: {
      name: string;
      username: string;
      avatar: string;
    };
    thumbnail: string;
    viewers: number;
    category: string;
  };
}

export function LiveStreamCard({ stream }: LiveStreamCardProps) {
  const navigate = useNavigate();

  const formatViewers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}B`;
    }
    return count.toString();
  };

  return (
    <div 
      onClick={() => navigate(`/live/${stream.id}`)}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-200">
        <img 
          src={stream.thumbnail} 
          alt={stream.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Live Badge */}
        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
          <Radio className="w-3 h-3" />
          <span className="text-xs uppercase tracking-wide">Canlı</span>
        </div>

        {/* Viewers Count */}
        <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full flex items-center gap-1.5">
          <Eye className="w-4 h-4" />
          <span className="text-sm">{formatViewers(stream.viewers)}</span>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full">
          <span className="text-xs">{stream.category}</span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
          {stream.title}
        </h3>
        
        <div className="flex items-center gap-3">
          <img 
            src={stream.seller.avatar} 
            alt={stream.seller.name}
            className="w-10 h-10 rounded-full border-2 border-purple-200"
          />
          <div>
            <p className="text-gray-900">{stream.seller.name}</p>
            <p className="text-gray-500 text-sm">@{stream.seller.username}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
