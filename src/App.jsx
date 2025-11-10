import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import LiveStreamPage from '@/pages/LiveStreamPage';
import HomePage from '@/pages/HomePage';
import StreamsPage from '@/pages/StreamsPage';
import ProfilePage from '@/pages/ProfilePage';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Whatnot Clone - Canlı Alışveriş Platformu</title>
        <meta name="description" content="Canlı yayın alışveriş platformu. Ürünleri keşfedin, canlı yayınları izleyin ve sohbet edin." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/streams" element={<StreamsPage />} />
            <Route path="/live/:streamId" element={<LiveStreamPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
          </Routes>
        </main>
        <AuthModal isOpen={isAuthModalOpen} setIsOpen={setIsAuthModalOpen} />
      </div>
    </>
  );
}

export default App;