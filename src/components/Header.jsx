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
    <header className="h-[72px] bg-cyber-deepPurple/80 backdrop-blur-md border-b border-cyber-border px-6 flex items-center justify-between sticky top-0 z-50 shadow-lg">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <img 
              src="https://raw.githubusercontent.com/yosoyorhan/repo2/refs/heads/main/src/logocumcum%20(1)-no-bg-HD.png" 
              alt="Livennervar Logo" 
              className="w-10 h-10 object-contain relative"
            />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-cyan">
            LIVENNER
          </span>
          <span className="text-xs ml-1 text-neon-cyan font-mono bg-cyber-surface px-2 py-1 rounded">BETA</span>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-neon-cyan transition-colors" />
          <input
            type="text"
            placeholder="Ara..."
            className="w-full h-11 pl-12 pr-4 bg-cyber-surface border border-cyber-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink focus:shadow-neon-pink transition-all duration-200 font-mono text-sm"
            onClick={handleFeatureClick}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/streams')} 
          className="w-11 h-11 rounded-lg bg-cyber-surface border border-cyber-border hover:border-neon-cyan text-gray-400 hover:text-neon-cyan transition-all"
        >
          <Video className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleFeatureClick} 
          className="w-11 h-11 rounded-lg bg-cyber-surface border border-cyber-border hover:border-neon-cyan text-gray-400 hover:text-neon-cyan transition-all"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleFeatureClick} 
          className="w-11 h-11 rounded-lg bg-cyber-surface border border-cyber-border hover:border-neon-cyan text-gray-400 hover:text-neon-cyan transition-all relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-neon-pink rounded-full animate-pulse"></span>
        </Button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-11 h-11 rounded-lg bg-gradient-to-r from-neon-pink to-neon-cyan p-[2px] hover:scale-105 transition-all"
              >
                <div className="w-full h-full bg-cyber-dark rounded-lg flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="min-w-[200px] bg-cyber-deepPurple/95 backdrop-blur-xl border border-cyber-border shadow-window rounded-xl p-2"
            >
              <DropdownMenuLabel className="text-sm font-mono text-gray-400">{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-cyber-border" />
              <DropdownMenuItem 
                onClick={() => navigate(`/profile/${user.id}`)} 
                className="rounded-lg hover:bg-cyber-surface cursor-pointer text-white focus:bg-cyber-surface focus:text-neon-cyan"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profilim</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/streams')} 
                className="rounded-lg hover:bg-cyber-surface cursor-pointer text-white focus:bg-cyber-surface focus:text-neon-cyan"
              >
                <Video className="mr-2 h-4 w-4" />
                <span>Yayınlarım</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={signOut} 
                className="rounded-lg hover:bg-red-500/20 cursor-pointer text-red-400 focus:bg-red-500/20 focus:text-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            onClick={onAuthClick} 
            className="rounded-lg bg-neon-pink hover:bg-neon-pinkDark text-white shadow-neon-pink hover:shadow-neon-pink-md hover:scale-105 transition-all min-h-[44px] px-5 flex items-center gap-2 font-bold border border-neon-pink/20"
          >
            <LogIn size={16}/> Giriş Yap
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;