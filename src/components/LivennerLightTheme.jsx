import React from 'react';
import { Play, Heart, MessageCircle, ShoppingBag, Zap } from 'lucide-react';

/**
 * LIVENNER Light Theme Demo Component
 * 
 * Bu component, kullanıcı tercihi için alternatif bir açık tema örneğidir.
 * Cyberpunk dark theme ile aynı yapıyı kullanır ama soft renklerle.
 * 
 * Kullanım: Ana projede kullanmak için App.jsx'e context eklenebilir.
 */

const LivennerLightTheme = () => {
  return (
    <div className="min-h-screen bg-[#f8faff] text-[#1a1333] font-sans overflow-hidden relative">
      {/* Arka plan glow efekti */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[300px] bg-[#6a4bff]/20 blur-[200px] rounded-full"></div>

      {/* NAVBAR */}
      <nav className="flex justify-between items-center p-6 relative z-10 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter text-[#6a4bff]">
          LIVENNER
          <span className="text-xs ml-2 text-[#836aff] font-mono bg-[#eceaff] px-2 py-1 rounded">BETA</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-[#4a4475]">
          <a href="#" className="hover:text-[#6a4bff] transition-colors">Keşfet</a>
          <a href="#" className="hover:text-[#6a4bff] transition-colors">Kategoriler</a>
          <a href="#" className="hover:text-[#6a4bff] transition-colors">Yayıncılar</a>
        </div>
        <button className="bg-[#6a4bff] text-white px-5 py-2 rounded-lg transition-all duration-300 shadow hover:shadow-lg font-mono text-sm">
          Giriş Yap
        </button>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* SOL TARAF: Metin */}
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 bg-[#edeaff] border border-[#dcd6ff] rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-mono text-[#6a4bff]">Canlı Mezat Sistemi Aktif</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Koleksiyonluk Ürünleri <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6a4bff] to-[#ff66c4]">
              Canlı Yayında
            </span> Kap.
          </h1>

          <p className="text-[#4a4475] text-lg max-w-md leading-relaxed">
            Nadir kartlar, retro oyunlar ve sneakerlar. Toplulukla sohbet et, teklif ver ve kazan.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="bg-[#6a4bff] hover:bg-[#836aff] text-white px-8 py-4 rounded-xl font-bold text-lg shadow transition-all hover:scale-105 flex items-center gap-2">
              <Play size={20} fill="currentColor" /> Yayını İzle
            </button>
            <button className="bg-transparent border border-[#6a4bff] text-[#6a4bff] hover:bg-[#6a4bff]/10 px-8 py-4 rounded-xl font-bold text-lg transition-all">
              Nasıl Çalışır?
            </button>
          </div>
        </div>

        {/* SAĞ TARAF: Görsel */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#6a4bff] to-[#ff66c4] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-white border border-[#eae6ff] rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-[#f4f2ff] px-4 py-3 flex items-center justify-between border-b border-[#dcd6ff]">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="text-xs font-mono text-[#6a4bff]">live_auction_v2.js</div>
            </div>

            <div className="p-1 bg-[#f9f8ff]">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-[#f1efff] to-[#eceaff] rounded-lg overflow-hidden group-hover:scale-[1.01] transition-transform duration-500">
                <div className="absolute inset-0 flex items-center justify-center text-[#6a4bff]/60 font-mono text-sm">
                  [CANLI YAYIN GÖRÜNTÜSÜ]
                </div>
                <div className="absolute top-4 left-4 bg-[#ff4d6d] text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> LIVE
                </div>
                <div className="absolute top-4 right-4 bg-white/70 text-[#1a1333] text-xs font-mono px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                  <Zap size={12} className="text-yellow-500" /> 1.2k İzleyici
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white/90 to-transparent">
                  <div className="flex items-end justify-between">
                    <div className="space-y-2">
                      <div className="bg-white/80 backdrop-blur-md text-[#1a1333] text-xs p-2 rounded-lg max-w-[200px] border border-[#eae6ff]">
                        <span className="text-[#6a4bff] font-bold">User123:</span> Abi o Charizard kartı efsane! 🔥
                      </div>
                      <div className="bg-white/80 backdrop-blur-md text-[#1a1333] text-xs p-2 rounded-lg max-w-[200px] border border-[#eae6ff]">
                        <span className="text-[#ff66c4] font-bold">Collector:</span> Teklifim 500$ 🚀
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button className="p-3 bg-[#f1efff] rounded-full text-[#ff66c4] hover:bg-[#ff66c4] hover:text-white transition-all shadow border border-[#eae6ff]">
                        <Heart size={20} />
                      </button>
                      <button className="p-3 bg-[#f1efff] rounded-full text-[#6a4bff] hover:bg-[#6a4bff] hover:text-white transition-all shadow border border-[#eae6ff]">
                        <ShoppingBag size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#f4f2ff] p-4 flex items-center justify-between border-t border-[#dcd6ff]">
              <div>
                <div className="text-xs text-[#4a4475] font-mono">Şu an satılıyor:</div>
                <div className="text-[#2b1d5c] font-bold text-lg">Pokemon Base Set Box</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#4a4475] font-mono">En yüksek teklif:</div>
                <div className="text-[#6a4bff] font-bold text-xl animate-pulse">$1,250</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ALT KISIM */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-3 gap-8 text-center">
        {[
          { title: 'Hızlı Kargo', icon: '📦', desc: 'Güvenli ve sigortalı gönderim.' },
          { title: 'Orijinallik', icon: '🛡️', desc: 'Uzmanlar tarafından doğrulandı.' },
          { title: 'Topluluk', icon: '👾', desc: 'Benzer ilgi alanlarına sahip kişiler.' },
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white border border-[#eae6ff] hover:border-[#6a4bff]/50 transition-colors group cursor-default shadow-sm">
            <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-500">{item.icon}</div>
            <h3 className="text-[#2b1d5c] font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-[#4a4475] text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LivennerLightTheme;
