import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import LiveStream from '@/components/LiveStream';
import ErrorBoundary from '@/components/ErrorBoundary';
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
    <ErrorBoundary>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] h-[calc(100vh-80px)] max-w-full overflow-hidden">
        <LiveStream streamId={streamId} />
        <ChatPanel streamId={streamId} />
      </div>
    </ErrorBoundary>
  );
};

export default LiveStreamPage;