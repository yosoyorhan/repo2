import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ShopSidebar from '@/components/ShopSidebar';
import LiveStream from '@/components/LiveStream';
import ChatPanel from '@/components/ChatPanel';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const LiveStreamPage = () => {
  const { streamId } = useParams();
  const { user } = useAuth();

  // Giriş zorunluluğu
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_340px] h-[calc(100vh-80px)] max-w-full overflow-hidden">
      <ShopSidebar />
      <LiveStream streamId={streamId} />
      <ChatPanel streamId={streamId} />
    </div>
  );
};

export default LiveStreamPage;