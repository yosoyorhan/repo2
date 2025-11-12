import React from 'react';
import { useParams } from 'react-router-dom';
import LiveStream from '@/components/LiveStream';
import ErrorBoundary from '@/components/ErrorBoundary';
import ChatPanel from '@/components/ChatPanel';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const LiveStreamPage = () => {
  const { streamId } = useParams();
  const { user } = useAuth();

  return (
    <ErrorBoundary>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] h-[calc(100vh-80px)] max-w-full overflow-hidden bg-[#fbfaff]">
        <LiveStream streamId={streamId} />
        <ChatPanel streamId={streamId} />
      </div>
    </ErrorBoundary>
  );
};

export default LiveStreamPage;