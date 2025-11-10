import React from 'react';
import { useParams } from 'react-router-dom';
import ShopSidebar from '@/components/ShopSidebar';
import LiveStream from '@/components/LiveStream';
import ChatPanel from '@/components/ChatPanel';

const LiveStreamPage = () => {
  const { streamId } = useParams();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_340px] h-[calc(100vh-80px)]">
      <ShopSidebar />
      <LiveStream streamId={streamId} />
      <ChatPanel streamId={streamId} />
    </div>
  );
};

export default LiveStreamPage;