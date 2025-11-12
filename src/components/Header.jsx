import React, { useState, useRef, useEffect } from 'react';
import { Search, MessageCircle, Bell, Bookmark, X, LayoutDashboard, ShoppingBag, Settings, LogOut, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const NotificationDropdown = () => (
  <div className="absolute top-14 right-0 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden animate-fadeInDropdown">
    <div className="p-4 border-b border-gray-200">
      <h3 className="font-bold text-lg text-[#1a1333]">Bildirimler</h3>
    </div>
    <div className="flex flex-col max-h-96 overflow-y-auto">
      <a href="#" className="p-4 flex items-center space-x-3 hover:bg-gray-100 transition-colors">
        <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold flex-shrink-0">K</div>
        <div>
          <p className="text-sm text-gray-800"><span className="font-bold">Koleksiyoncu</span> yeni bir yayın başlattı.</p>
          <span className="text-xs text-gray-500">2 dakika önce</span>
        </div>
      </a>
    </div>
    <div className="p-3 bg-gray-50 text-center border-t border-gray-200">
      <a href="#" className="text-sm font-medium text-purple-600 hover:text-pink-500">Tüm bildirimleri gör</a>
    </div>
  </div>
);

const ProfileDrawer = ({ onClose, user, signOut }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Kullanıcı';
  const avatarInitial = displayName[0]?.toUpperCase() || 'U';

  const go = (path) => {
    if (!path) return;
    navigate(path);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 animate-fadeIn" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white z-50 shadow-xl animate-slideInRight">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#1a1333]">Menü</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-pink-500 transition-colors"><X size={24} /></button>
          </div>
          
          {/* User Profile Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={displayName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-purple-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center font-bold text-2xl text-white border-2 border-purple-200 flex-shrink-0"
                style={{ display: profile?.avatar_url ? 'none' : 'flex' }}
              >
                {avatarInitial}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#1a1333] truncate">{displayName}</h3>
                <p className="text-xs text-[#4a4475] truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => go(`/profile/${user?.id}`)}
              className="block w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white text-center py-2 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-pink-500/50 transition-all"
            >
              Profili Görüntüle
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-2">
            <button onClick={() => go(`/profile/${user?.id}?tab=streams`)} className="w-full text-left px-5 py-3.5 text-md text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center space-x-3 transition-colors">
              <LayoutDashboard size={20} className="text-purple-500" />
              <span className="font-medium">Yayınlarım</span>
            </button>
            <button onClick={() => go(`/profile/${user?.id}?tab=collections`)} className="w-full text-left px-5 py-3.5 text-md text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center space-x-3 transition-colors">
              <ShoppingBag size={20} className="text-pink-500" />
              <span className="font-medium">Koleksiyonlarım</span>
            </button>
            <button onClick={() => go(`/profile/${user?.id}?tab=purchased`)} className="w-full text-left px-5 py-3.5 text-md text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center space-x-3 transition-colors">
              <Package size={20} className="text-orange-500" />
              <span className="font-medium">Satın Alımlarım</span>
            </button>
            <button onClick={() => go(`/profile/${user?.id}?tab=activity`)} className="w-full text-left px-5 py-3.5 text-md text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center space-x-3 transition-colors">
              <Bookmark size={20} className="text-purple-500" />
              <span className="font-medium">Aktivite</span>
            </button>
            <div className="my-2 border-t border-gray-200"></div>
            <button onClick={() => go(`/profile/${user?.id}?tab=about`)} className="w-full text-left px-5 py-3.5 text-md text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center space-x-3 transition-colors">
              <Settings size={20} className="text-gray-500" />
              <span className="font-medium">Ayarlar</span>
            </button>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={() => { signOut(); onClose(); }} 
              className="w-full px-5 py-3 text-md text-red-500 bg-red-50 hover:bg-red-100 font-bold flex items-center justify-center space-x-3 rounded-full transition-colors"
            >
              <LogOut size={20} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Header = ({ onAuthClick }) => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openDropdown === 'notifications' &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const handleFeatureClick = () => {
    toast({ title: "🚧 Bu özellik henüz hazır değil!", description: "Bir sonraki promptunda isteyebilirsin! 🚀" });
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInDropdown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-fadeInDropdown { animation: fadeInDropdown 0.2s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
      `}</style>
      <nav className="sticky top-0 z-40 w-full bg-[#fbfaff] border-b-2 border-purple-500 h-20 flex items-center">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600">LIVENNER</span>
              <span className="text-xs ml-2 text-pink-600 font-mono bg-pink-100 px-2 py-1 rounded hidden sm:inline">BETA</span>
            </Link>
            <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-[#4a4475]">
              <Link to="/" className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg font-bold">Anasayfa</Link>
              <Link to="/streams" className="hover:text-pink-500 transition-colors">Keşfet</Link>
            </div>
          </div>
          <div className="flex-1 px-8 hidden lg:flex justify-center">
            <div className="relative w-full max-w-lg">
              <input type="text" placeholder="Livenner'da ara..." className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 pl-10 text-sm placeholder-[#4a4475]/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" onClick={handleFeatureClick} />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4475]/70" />
            </div>
          </div>
          <div ref={dropdownRef} className="flex items-center space-x-3 sm:space-x-5 text-[#4a4475]">
            <button className="hidden lg:block bg-orange-100 text-orange-600 hover:bg-orange-200 px-4 py-2 rounded-full text-sm font-bold transition-colors" onClick={() => navigate('/streams')}>Yayıncı Ol</button>
            <button className="relative hover:text-pink-500 transition-colors lg:hidden" onClick={handleFeatureClick}><Search size={24} /></button>
            <button className="relative hover:text-pink-500 transition-colors hidden lg:block" onClick={handleFeatureClick}><MessageCircle size={24} /></button>
            <button className="relative hover:text-pink-500 transition-colors hidden lg:block" onClick={handleFeatureClick}><Bookmark size={24} /></button>
            <button onClick={() => setOpenDropdown(prev => (prev === 'notifications' ? null : 'notifications'))} className="relative hover:text-pink-500 transition-colors">
              <Bell size={24} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-[#fbfaff]"></span>
            </button>
            {user ? (
              <button onClick={() => setOpenDropdown(prev => (prev === 'profile' ? null : 'profile'))} className="hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm border border-pink-200">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
              </button>
            ) : (
              <Button onClick={onAuthClick} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow hover:shadow-lg transition-all min-h-[44px] px-5 flex items-center gap-2 font-bold">Giriş Yap</Button>
            )}
            {openDropdown === 'notifications' && <NotificationDropdown />}
          </div>
        </div>
      </nav>
      {openDropdown === 'profile' && <ProfileDrawer onClose={() => setOpenDropdown(null)} user={user} signOut={signOut} />}
    </>
  );
};

export default Header;
