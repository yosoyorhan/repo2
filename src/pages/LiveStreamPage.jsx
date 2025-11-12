import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import LiveStream from '@/components/LiveStream';
import ErrorBoundary from '@/components/ErrorBoundary';
import ChatPanel from '@/components/ChatPanel';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const LiveStreamPage = () => {
  const { streamId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  
  // StartStreamPage'den gelen koleksiyon bilgisi
  const collectionId = location.state?.collectionId;
  const collectionName = location.state?.collectionName;

  return (
    <ErrorBoundary>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] h-[calc(100vh-80px)] max-w-full overflow-hidden bg-[#fbfaff]">
        <LiveStream 
          streamId={streamId} 
          initialCollectionId={collectionId}
          initialCollectionName={collectionName}
        />
        <ChatPanel streamId={streamId} />
      </div>
    </ErrorBoundary>
  );
};

export default LiveStreamPage;