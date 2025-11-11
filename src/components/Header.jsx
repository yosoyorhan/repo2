import React from 'react';
import { Search, MessageSquare, Bell, Gift, UserCircle, LogIn, LogOut, Video } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = ({ onAuthClick }) => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleFeatureClick = () => {
    toast({
      title: "🚧 Bu özellik henüz hazır değil!",
      description: "Bir sonraki promptunda isteyebilirsin! 🚀",
    });
  };

  return (
    <header className="h-[72px] bg-gradient-to-b from-[rgba(255,255,255,0.6)] to-[rgba(255,255,255,0.5)] backdrop-blur-md border-b border-[rgba(16,24,40,0.04)] px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="https://raw.githubusercontent.com/yosoyorhan/repo2/refs/heads/main/src/logocumcum%20(1)-no-bg-HD.png" 
            alt="Livennervar Logo" 
            className="w-10 h-10 object-contain"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-[#7b3fe4] to-[#e53dd2] bg-clip-text text-transparent">Livennervar</span>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Ara..."
            className="w-full h-11 pl-12 pr-4 bg-[rgba(255,255,255,0.9)] backdrop-blur-sm rounded-full border border-[rgba(16,24,40,0.06)] shadow-inner focus:outline-none focus:border-[#7b3fe4] focus:shadow-[0_6px_20px_rgba(123,63,228,0.06)] transition-all duration-200"
            onClick={handleFeatureClick}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/streams')} className="w-11 h-11 rounded-full hover:bg-[rgba(123,63,228,0.08)] transition-all">
          <Video className="w-5 h-5 text-gray-600" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleFeatureClick} className="w-11 h-11 rounded-full hover:bg-[rgba(123,63,228,0.08)] transition-all">
          <MessageSquare className="w-5 h-5 text-gray-600" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleFeatureClick} className="w-11 h-11 rounded-full hover:bg-[rgba(123,63,228,0.08)] transition-all">
          <Bell className="w-5 h-5 text-gray-600" />
        </Button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-11 h-11 rounded-full hover:bg-[rgba(123,63,228,0.08)] transition-all">
                <UserCircle className="w-6 h-6 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px] bg-[rgba(255,255,255,0.95)] backdrop-blur-xl border border-white/40 shadow-lg rounded-[16px] p-2">
              <DropdownMenuLabel className="text-sm font-medium text-gray-700">{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200/50" />
              <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)} className="rounded-lg hover:bg-[rgba(123,63,228,0.08)] cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profilim</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/streams')} className="rounded-lg hover:bg-[rgba(123,63,228,0.08)] cursor-pointer">
                <Video className="mr-2 h-4 w-4" />
                <span>Yayınlarım</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut} className="rounded-lg hover:bg-red-50 cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={onAuthClick} className="rounded-full bg-gradient-to-r from-[#7b3fe4] to-[#e53dd2] text-white shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 transition-all min-h-[44px] px-5 flex items-center gap-2">
            <LogIn size={16}/> Giriş Yap
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;