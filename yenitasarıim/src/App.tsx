import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, Radio, User, ShoppingBag, Heart, Bell } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { SellerProfile } from './components/SellerProfile';
import { LiveStreamViewer } from './components/LiveStreamViewer';
import { LiveStreamSeller } from './components/LiveStreamSeller';
import { StartStream } from './components/StartStream';
import { ProductManagement } from './components/ProductManagement';
import { CollectionManagement } from './components/CollectionManagement';
import { CheckoutFlow } from './components/CheckoutFlow';
import { useState } from 'react';

function App() {
  const [currentUser, setCurrentUser] = useState({
    id: '1',
    name: 'Ahmet Yılmaz',
    username: 'ahmetyilmaz',
    isSeller: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet'
  });

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <Routes>
          <Route path="/" element={<HomePage currentUser={currentUser} />} />
          <Route path="/profile/:username" element={<SellerProfile currentUser={currentUser} />} />
          <Route path="/live/:streamId" element={<LiveStreamViewer currentUser={currentUser} />} />
          <Route path="/stream/:streamId/host" element={<LiveStreamSeller currentUser={currentUser} />} />
          <Route path="/start-stream" element={<StartStream currentUser={currentUser} />} />
          <Route path="/products/manage" element={<ProductManagement currentUser={currentUser} />} />
          <Route path="/collections/manage" element={<CollectionManagement currentUser={currentUser} />} />
          <Route path="/checkout/:productId" element={<CheckoutFlow currentUser={currentUser} />} />
        </Routes>
        
        <BottomNav currentUser={currentUser} />
      </div>
    </Router>
  );
}

function BottomNav({ currentUser }: { currentUser: any }) {
  const navigate = useNavigate();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center h-16 px-4">
        <Link to="/" className="flex flex-col items-center gap-1 text-gray-600 hover:text-purple-600">
          <Home className="w-6 h-6" />
          <span className="text-xs">Keşfet</span>
        </Link>
        
        <Link to="/favorites" className="flex flex-col items-center gap-1 text-gray-600 hover:text-purple-600">
          <Heart className="w-6 h-6" />
          <span className="text-xs">Favoriler</span>
        </Link>
        
        {currentUser.isSeller && (
          <button
            onClick={() => navigate('/start-stream')}
            className="flex flex-col items-center gap-1 -mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-4 shadow-lg"
          >
            <Radio className="w-7 h-7" />
          </button>
        )}
        
        <Link to="/notifications" className="flex flex-col items-center gap-1 text-gray-600 hover:text-purple-600">
          <Bell className="w-6 h-6" />
          <span className="text-xs">Bildirimler</span>
        </Link>
        
        <Link to={`/profile/${currentUser.username}`} className="flex flex-col items-center gap-1 text-gray-600 hover:text-purple-600">
          <User className="w-6 h-6" />
          <span className="text-xs">Profil</span>
        </Link>
      </div>
    </nav>
  );
}

export default App;
