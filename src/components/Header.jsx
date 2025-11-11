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
    <header className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="https://raw.githubusercontent.com/yosoyorhan/repo2/refs/heads/main/src/logocumcum-no-bg-beyaz.png" 
            alt="Livennervar Logo" 
            className="w-10 h-10 object-contain"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Livennervar</span>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full h-12 pl-12 pr-4 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#FFDE59] transition-all"
            onClick={handleFeatureClick}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/streams')}>
          <Video className="w-6 h-6 text-gray-600" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleFeatureClick}>
          <MessageSquare className="w-6 h-6 text-gray-600" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleFeatureClick}>
          <Bell className="w-6 h-6 text-gray-600" />
        </Button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="w-6 h-6 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profilim</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/streams')}>
                <Video className="mr-2 h-4 w-4" />
                <span>Yayınlarım</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={onAuthClick} variant="outline" className="rounded-full flex items-center gap-2">
            <LogIn size={16}/> Giriş Yap
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;