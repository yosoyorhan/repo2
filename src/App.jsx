import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import LiveStreamPage from '@/pages/LiveStreamPage';
import HomePage from '@/pages/HomePage';
import StreamsPage from '@/pages/StreamsPage';
import ProfilePage from '@/pages/ProfilePage';
import StartStreamPage from '@/pages/StartStreamPage';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>LIVENNER - Canlı Mezat Platformu</title>
        <meta name="description" content="Nadir koleksiyonlar, retro oyunlar ve özel ürünleri canlı yayında keşfet. Toplulukla sohbet et, teklif ver ve kazan!" />
      </Helmet>
      <div className="min-h-screen bg-[#fbfaff] flex flex-col">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/streams" element={<StreamsPage />} />
            <Route path="/start-stream" element={<StartStreamPage />} />
            <Route path="/stream/:streamId" element={<LiveStreamPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
          </Routes>
        </main>
        <AuthModal isOpen={isAuthModalOpen} setIsOpen={setIsAuthModalOpen} />
      </div>
    </>
  );
}

export default App;