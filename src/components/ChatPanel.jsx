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
        <TabsList className="w-full grid grid-cols-2 bg-gray-100 rounded-none">
          <TabsTrigger value="chat" className="rounded-none data-[state=active]:bg-white flex items-center gap-2">
            <Send className="w-4 h-4" /> Chat
          </TabsTrigger>
          <TabsTrigger value="watching" className="rounded-none data-[state=active]:bg-white flex items-center gap-2">
            <Users className="w-4 h-4" /> İzleyenler ({viewers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col mt-0 overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
             <AnimatePresence>
                {chatMessages.map((msg, index) => (
                   <motion.div 
                        key={msg.id || index} 
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {msg.profiles?.avatar_url ? <img alt={msg.profiles.username} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1652841190565-b96e0acbae17" /> : <span className="text-sm font-semibold">{msg.profiles?.username?.[0].toUpperCase()}</span>}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{msg.profiles?.username || 'Kullanıcı'}</span>
                      <p className="text-sm text-gray-700 bg-gray-100 p-2 rounded-lg break-words">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
             </AnimatePresence>
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={user ? "Bir mesaj yaz..." : "Sohbete katılmak için giriş yap"}
                className="w-full h-12 pl-4 pr-12 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
                disabled={!user}
              />
              <button type="submit" disabled={!user || !message.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FFDE59] rounded-full flex items-center justify-center hover:bg-[#FFD700] disabled:bg-gray-300 transition-all">
                <Send className="w-4 h-4 text-gray-900" />
              </button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="watching" className="flex-1 overflow-y-auto p-4 mt-0">
          <div className="space-y-2">
            {viewers.map((viewer) => (
              <div key={viewer.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-gray-700">{viewer.username[0].toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{viewer.username}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatPanel;