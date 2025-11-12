import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const AuthModal = ({ isOpen, setIsOpen }) => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isLoginView, setIsLoginView] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let error;
    if (isLoginView) {
      ({ error } = await signIn(form.email, form.password));
    } else {
      if (!form.username) {
          toast({ variant: "destructive", title: "Validation Error", description: "Username is required." });
          setLoading(false);
          return;
      }
      ({ error } = await signUp(form.email, form.password, {
        data: { username: form.username },
      }));
    }

    if (!error) {
      setIsOpen(false);
      setForm({ username: '', email: '', password: '' }); // Reset form
    }
    setLoading(false);
  };
  
  const handleOpenChange = (open) => {
    if (!open) {
      setForm({ username: '', email: '', password: '' });
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-cyber-deepPurple rounded-2xl shadow-window w-[400px] p-8 border border-cyber-border">
        <DialogTitle className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-cyan">Hoş Geldin 👋</DialogTitle>
        <DialogDescription className="sr-only">
          {isLoginView ? 'Giriş yap veya yeni hesap oluştur' : 'Yeni hesap oluştur'}
        </DialogDescription>

        <div className="flex justify-center mb-6 bg-cyber-dark p-1 rounded-lg border border-cyber-border">
          <button
            className={`w-1/2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 font-mono ${isLoginView ? 'bg-cyber-surface text-neon-pink shadow-neon-pink' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setIsLoginView(true)}
          >
            Giriş Yap
          </button>
          <button
            className={`w-1/2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 font-mono ${!isLoginView ? 'bg-cyber-surface text-neon-cyan shadow-neon-cyan' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setIsLoginView(false)}
          >
            Kayıt Ol
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
                key={isLoginView ? 'login' : 'register'}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
              {!isLoginView && (
                  <div className="space-y-2">
                    <Label htmlFor="username-signup" className="text-gray-300 font-mono text-sm">Kullanıcı Adı</Label>
                    <Input
                      id="username-signup"
                      type="text"
                      placeholder="kullanici_adin"
                      className="w-full"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                    />
                  </div>
              )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 font-mono text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@mail.com"
                    className="w-full"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 font-mono text-sm">Parola</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
            </motion.div>
          </AnimatePresence>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-pink hover:bg-neon-pinkDark text-white font-bold rounded-lg py-2.5 transition-transform hover:scale-105 shadow-neon-pink-md"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLoginView ? 'Giriş Yap' : 'Kayıt Ol')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;