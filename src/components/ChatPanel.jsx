import React, { useState, useEffect, useRef } from 'react';
import { Gift, Send, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { AnimatePresence, motion } from 'framer-motion';

const ChatPanel = ({ streamId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [viewers, setViewers] = useState([]);
  const scrollRef = useRef(null);

  return (
    <div className="bg-white border-l border-gray-200 flex flex-col h-full">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 bg-white rounded-none border-b border-gray-200">
          <TabsTrigger value="chat" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 text-[#4a4475] flex items-center gap-2">

  useEffect(() => {
          <TabsTrigger value="viewers" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 text-[#4a4475] flex items-center gap-2">

    // Fetch initial messages
    const fetchMessages = async () => {
        <TabsContent value="chat" className="flex-1 flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white">
            .select(`*, profiles(username, avatar_url)`)
              <div key={msg.id} className="text-[#1a1333] text-sm"> 
                <span className="text-purple-600 font-bold">{msg.profiles?.username || 'Kullanıcı'}:</span> {msg.content}
        
        if (!error && data) {
            // Sadece yeni mesajları ekle (duplicate önleme)
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input 
                className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-[#1a1333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            });
        }
    };
    fetchMessages();
              <button type="submit" className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white rounded-full px-4 py-2 text-sm hover:opacity-90">Gönder</button>
    // Subscribe to new messages (realtime) - Supabase realtime is instant!
    const messageChannel = supabase.channel(`public:stream_messages:stream=${streamId}`)
      .on('postgres_changes', {
        <TabsContent value="viewers" className="flex-1">
          <div className="p-4 space-y-2 text-[#1a1333] bg-white">
        table: 'stream_messages',
              <p className="text-[#4a4475]">Henüz izleyici yok</p>
      }, (payload) => {
        // Profil bilgisi zaten payload.new.profiles ile geliyorsa ekle, yoksa sadece mesajı ekle
        setChatMessages(currentMessages => {
          // Duplicate kontrolü
          if (currentMessages.some(msg => msg.id === payload.new.id)) {
            return currentMessages;
          }
          return [...currentMessages, { ...payload.new }];
        });
      })
      .subscribe();
      
    // Presence for viewers list
    const presenceChannel = supabase.channel(`presence-${streamId}`);
    presenceChannel.on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const userList = Object.keys(state).map(id => {
            return { id, username: state[id][0].username };
        });
        setViewers(userList);
    }).subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user) {
            await presenceChannel.track({ username: user.user_metadata.username || 'Anonymous' });
        }
    });

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [streamId, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user) {
      if (!user) toast({ title: "Mesaj göndermek için giriş yapmalısın!", variant: 'destructive'});
      return;
    }

    const content = message.trim();
    const pendingId = `temp-${Date.now()}`;

    // Optimistic UI: mesajı hemen ekle
    setChatMessages((prev) => [
      ...prev,
      { id: pendingId, stream_id: streamId, user_id: user.id, content, profiles: { username: user.user_metadata?.username || user.email } }
    ]);
    setMessage('');

    const { error } = await supabase
      .from('stream_messages')
      .insert({
        stream_id: streamId,
        user_id: user.id,
        content
      });

    if (error) {
      toast({ title: 'Mesaj gönderilemedi', description: error.message, variant: 'destructive' });
      // Hata olursa optimistic mesajı geri al
      setChatMessages((prev) => prev.filter(m => m.id !== pendingId));
    }
  };

  return (
    <div className="bg-cyber-darkPurple border-l border-cyber-border flex flex-col h-full">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 bg-cyber-dark rounded-none border-b border-cyber-border">
          <TabsTrigger value="chat" className="rounded-none data-[state=active]:bg-cyber-surface data-[state=active]:text-neon-pink text-gray-400 flex items-center gap-2 font-mono">
            <Send className="w-4 h-4" /> Chat
          </TabsTrigger>
          <TabsTrigger value="watching" className="rounded-none data-[state=active]:bg-cyber-surface data-[state=active]:text-neon-cyan text-gray-400 flex items-center gap-2 font-mono">
            <Users className="w-4 h-4" /> İzleyenler ({viewers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col mt-0 overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
             <AnimatePresence>
                {chatMessages.map((msg, index) => (
                   <motion.div 
                        key={msg.id || index} 
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                    <div className="w-8 h-8 bg-gradient-to-br from-neon-pink to-neon-cyan rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {msg.profiles?.avatar_url ? <img alt={msg.profiles.username} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1652841190565-b96e0acbae17" /> : <span className="text-sm font-bold text-white">{msg.profiles?.username?.[0].toUpperCase()}</span>}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-mono font-bold text-neon-cyan">{msg.profiles?.username || 'Kullanıcı'}</span>
                      <p className="text-sm text-gray-300 bg-cyber-surface/50 p-2 rounded-lg break-words mt-1 border border-cyber-borderLight">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
             </AnimatePresence>
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t border-cyber-border">
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={user ? "Bir mesaj yaz..." : "Sohbete katılmak için giriş yap"}
                className="w-full h-12 pl-4 pr-12 bg-cyber-surface rounded-lg border border-cyber-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink font-mono text-sm transition-all"
                disabled={!user}
              />
              <button type="submit" disabled={!user || !message.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-neon-pink rounded-lg flex items-center justify-center hover:bg-neon-pinkDark disabled:bg-gray-600 disabled:opacity-50 transition-all shadow-neon-pink">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="watching" className="flex-1 overflow-y-auto p-4 mt-0 custom-scrollbar">
          <div className="space-y-2">
            {viewers.map((viewer) => (
              <div key={viewer.id} className="flex items-center gap-3 p-3 rounded-lg bg-cyber-surface/30 hover:bg-cyber-surface border border-cyber-borderLight hover:border-neon-cyan/30 transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-neon-pink to-neon-cyan rounded-full flex items-center justify-center">
                  <span className="font-bold text-white text-sm">{viewer.username[0].toUpperCase()}</span>
                </div>
                <span className="text-sm font-mono font-medium text-gray-300">{viewer.username}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatPanel;