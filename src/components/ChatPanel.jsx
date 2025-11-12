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

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (!streamId) return;

    // Fetch initial messages
    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('stream_messages')
            .select(`*, profiles(username, avatar_url)`)
            .eq('stream_id', streamId)
            .order('created_at', { ascending: true });
        
        if (!error && data) {
            // Sadece yeni mesajları ekle (duplicate önleme)
            setChatMessages(prevMessages => {
              const existingIds = new Set(prevMessages.map(m => m.id));
              const newMessages = data.filter(m => !existingIds.has(m.id));
              return newMessages.length > 0 ? data : prevMessages;
            });
        }
    };
    fetchMessages();

    // Subscribe to new messages (realtime) - Supabase realtime is instant!
    const messageChannel = supabase.channel(`public:stream_messages:stream=${streamId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'stream_messages',
        filter: `stream_id=eq.${streamId}`
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
    <div className="bg-white border-l border-gray-200 flex flex-col h-full">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 bg-white rounded-none border-b border-gray-200">
          <TabsTrigger value="chat" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 text-[#4a4475] flex items-center gap-2">
            Sohbet
          </TabsTrigger>
          <TabsTrigger value="viewers" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 text-[#4a4475] flex items-center gap-2">
            İzleyiciler
          </TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="flex-1 flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-[#1a1333] text-sm"> 
                <span className="text-purple-600 font-bold">{msg.profiles?.username || 'Kullanıcı'}:</span> {msg.content}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input 
                className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-[#1a1333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                placeholder={user ? "Mesaj yaz..." : "Mesaj için giriş yap"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit" className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white rounded-full px-4 py-2 text-sm hover:opacity-90">Gönder</button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="viewers" className="flex-1">
          <div className="p-4 space-y-2 text-[#1a1333] bg-white">
            {viewers.length === 0 ? (
              <p className="text-[#4a4475]">Henüz izleyici yok</p>
            ) : viewers.map(v => (
              <div key={v.id} className="text-sm">@{v.username}</div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatPanel;
