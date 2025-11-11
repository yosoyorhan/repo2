import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, Camera, Loader2, Link as LinkIcon, Gavel, TrendingUp, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const LiveStream = ({ streamId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const videoRef = useRef(null);
  // Tek izleyici için kullanılan PC (izleyici cihazındayken)
  const peerConnectionRef = useRef(null);
  // Publisher iken her izleyici için ayrı RTCPeerConnection tut
  const publisherPeersRef = useRef(new Map()); // viewerId -> RTCPeerConnection
  const signalingRef = useRef(null);
  const streamRef = useRef(null);
  const previewRef = useRef(null);
  const hlsRef = useRef(null);
  const retryTimerRef = useRef(null);

  const [streamData, setStreamData] = useState(null);
  const [streamEnded, setStreamEnded] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerMuted, setViewerMuted] = useState(true);
  const [orientation, setOrientation] = useState('landscape'); // 'portrait' | 'landscape'
  const [facingMode, setFacingMode] = useState('user'); // 'user' | 'environment'
  const navBlockRef = useRef(false);

  // Debug/diagnostic states
  const [connState, setConnState] = useState('new');
  const [sigState, setSigState] = useState('stable');
  const [iceConnState, setIceConnState] = useState('new');
  const [iceGatherState, setIceGatherState] = useState('new');
  // Debug kaldırıldı; opsiyonel olarak env ile açılabilir.
  const [logs, setLogs] = useState([]);
  const debugEnabled = import.meta.env.VITE_DEBUG_STREAM === 'true';
  const [hlsActive, setHlsActive] = useState(false);
  const [requestRetries, setRequestRetries] = useState(0);

  // Auction states
  const [activeAuction, setActiveAuction] = useState(null);
  const [showAuctionPanel, setShowAuctionPanel] = useState(false);
  const [showCollectionSelector, setShowCollectionSelector] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [auctionBids, setAuctionBids] = useState([]);
  const [auctionChannel, setAuctionChannel] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [auctionWinner, setAuctionWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const isPublisher = user && streamData && user.id === streamData.user_id;

  // Route / sayfa değişiminde yayıncıyı uyarmak için hafif mekanizma
  useEffect(() => {
    if (!isPublisher || !isStreaming) return;
    const beforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [isPublisher, isStreaming]);

  // Cleanup function
  const cleanup = useCallback(() => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
        setHlsActive(false);
      }
      if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
      if (previewRef.current) {
          previewRef.current.getTracks().forEach(track => track.stop());
          previewRef.current = null;
      }
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
      if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
      }
  setIsStreaming(false);
  setRequestRetries(0);
  setStreamEnded(false);
  setPreviewActive(false);
  }, []);

  const log = useCallback((msg) => {
    if (!debugEnabled) return;
    const line = `${new Date().toLocaleTimeString()} | ${msg}`;
    setLogs(prev => [line, ...prev].slice(0, 200));
  }, [debugEnabled]);

  useEffect(() => {
    const fetchStreamData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('streams')
        .select('id, user_id, title, status, stream_url, orientation, created_at, updated_at')
        .eq('id', streamId)
        .single();
      if (error || !data) {
        toast({ title: 'Yayın bulunamadı!', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      setStreamData(data);
      // Yayıncı değilse ve orientation bilgisi varsa, onu kullan
      if (!isPublisher && data.orientation) {
        setOrientation(data.orientation);
      }
      setIsLoading(false);
      if (data.status === 'ended') setStreamEnded(true);
    };

    fetchStreamData();
    
    // Subscribe to stream status changes
    const streamChannel = supabase.channel(`stream-status-${streamId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'streams',
        filter: `id=eq.${streamId}`
      }, (payload) => {
        setStreamData(payload.new);
        // İzleyici orientation senkronizasyonu
        if (!isPublisher && payload.new.orientation) {
          setOrientation(payload.new.orientation);
        }
        if (payload.new.status === 'ended') {
          setStreamEnded(true);
          cleanup();
          
          // İzleyici ise bildirim göster ve ana sayfaya yönlendir
          if (!isPublisher) {
            toast({ 
              title: 'Yayın sona erdi, teşekkürler! 👋',
              description: 'Ana sayfaya yönlendiriliyorsunuz...'
            });
            setTimeout(() => navigate('/'), 3000);
          } else {
            toast({ title: 'Yayın sona erdi.' });
          }
        } else if (payload.new.status === 'active') {
          setStreamEnded(false); // Yayın tekrar aktif olunca flag'i temizle
        }
        if (payload.new.status === 'inactive' && !isPublisher) {
          toast({ title: 'Yayın sona erdi.' });
          cleanup();
        }
      })
      .subscribe();
        
    return () => {
      cleanup();
      supabase.removeChannel(streamChannel);
    };
  }, [streamId, toast, isPublisher, cleanup]);

  // Publisher sayfa yenilemek veya geri gitmek isterse uyarı popup’ı
  useEffect(() => {
    if (!isPublisher || !streamData?.id || !isStreaming) return;
    let confirmed = false;
    const endStream = async () => {
      await supabase.from('streams').update({ status: 'ended' }).eq('id', streamData.id);
    };
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Yayını sona erdireceksiniz. Emin misiniz?';
      // Modern tarayıcılar custom metni göstermez, sadece uyarı popup’ı açar
      if (confirmed) {
        endStream();
      }
      return 'Yayını sona erdireceksiniz. Emin misiniz?';
    };
    const handlePopState = (e) => {
      if (!confirmed) {
        const result = window.confirm('Yayını sona erdireceksiniz. Emin misiniz?');
        if (result) {
          confirmed = true;
          endStream();
          window.history.back();
        } else {
          e.preventDefault();
          window.history.pushState(null, '', window.location.href);
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isPublisher, streamData?.id, isStreaming]);

  // Koleksiyon seçim modal'ı açıldığında koleksiyonları yükle
  useEffect(() => {
    if (showCollectionSelector && user) {
      fetchCollections();
    }
  }, [showCollectionSelector, user]);

  // Yayını Bitir butonu
  const endStreamManually = async () => {
    if (!isPublisher || !streamData?.id) return;
    await supabase.from('streams').update({ status: 'ended' }).eq('id', streamData.id);
    setStreamEnded(true);
    cleanup();
    toast({ title: 'Yayın sona erdi.' });
  };

  // WebRTC Logic
  useEffect(() => {
    if (!streamData || isLoading) return;

    // Giriş zorunluluğu: izleyici giriş yapmadıysa hiçbir signaling/bağlantı yapma
    if (!isPublisher && !user) return;

  const signalingChannel = supabase.channel(`signaling-${streamId}`);
  signalingRef.current = signalingChannel;

  const setupPeerConnection = () => {
    if (isPublisher) return; // Publisher izleyici PC oluşturmaz
    if (peerConnectionRef.current) return;
        const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
        const turnUrl = import.meta.env.VITE_TURN_URL;
        const turnUser = import.meta.env.VITE_TURN_USERNAME;
        const turnCred = import.meta.env.VITE_TURN_CREDENTIAL;
        if (turnUrl && turnUser && turnCred) {
          iceServers.push({ urls: turnUrl, username: turnUser, credential: turnCred });
        }
        const pc = new RTCPeerConnection({ iceServers });
        peerConnectionRef.current = pc;

        pc.onconnectionstatechange = () => {
          setConnState(pc.connectionState);
          log(`connectionState: ${pc.connectionState}`);
        };
        pc.onsignalingstatechange = () => {
          setSigState(pc.signalingState);
          log(`signalingState: ${pc.signalingState}`);
        };
        pc.oniceconnectionstatechange = () => {
          setIceConnState(pc.iceConnectionState);
          log(`iceConnectionState: ${pc.iceConnectionState}`);
        };
        pc.onicegatheringstatechange = () => {
          setIceGatherState(pc.iceGatheringState);
          log(`iceGatheringState: ${pc.iceGatheringState}`);
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                signalingChannel.send({
                    type: 'broadcast',
                    event: 'ice-candidate',
                    payload: { candidate: event.candidate },
                });
                log('sent ice-candidate');
            }
        };

        pc.ontrack = (event) => {
            if (videoRef.current) {
                videoRef.current.srcObject = event.streams[0];
                setIsStreaming(true);
                setViewerMuted(true); // autoplay için sessize al
                // Mobilde autoplay'in çalışmaması durumuna karşı play() çağır
                videoRef.current.play().catch(() => {});
                // HLS aktifse kapat
                if (hlsRef.current) {
                  try { hlsRef.current.destroy(); } catch {}
                  hlsRef.current = null;
                  setHlsActive(false);
                }
                log('remote track received');
            }
        };
    };

    setupPeerConnection();
    const pc = peerConnectionRef.current;

    const handleSignaling = async (message) => {
        const { event, payload } = message;
        if (!isPublisher && !pc) return;

        try {
            if (event === 'offer' && !isPublisher) {
                // Eğer offer belirli bir viewerId için ise ve bu cihazın kimliği farklıysa yok say
                if (payload?.viewerId && user?.id && payload.viewerId !== user.id) return;
                await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                signalingChannel.send({ type: 'broadcast', event: 'answer', payload: { answer, viewerId: user?.id } });
                log('received offer -> sent answer');
            } else if (event === 'answer' && isPublisher) {
                const vid = payload?.viewerId;
                if (!vid) return;
                const ppc = publisherPeersRef.current.get(vid);
                if (ppc) {
                  await ppc.setRemoteDescription(new RTCSessionDescription(payload.answer));
                  log(`publisher received answer from ${vid}`);
                }
            } else if (event === 'ice-candidate') {
                if (!isPublisher) {
                  await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
                } else {
                  const vid = payload?.viewerId;
                  const ppc = vid && publisherPeersRef.current.get(vid);
                  if (ppc) await ppc.addIceCandidate(new RTCIceCandidate(payload.candidate));
                }
                log('received ice-candidate');
            } else if (event === 'request-offer' && isPublisher) {
                const vid = payload?.viewerId;
                if (!vid || !streamRef.current) return;
                // Her izleyici için ayrı PC oluştur
                let ppc = publisherPeersRef.current.get(vid);
                if (!ppc) {
                  const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
                  const turnUrl = import.meta.env.VITE_TURN_URL;
                  const turnUser = import.meta.env.VITE_TURN_USERNAME;
                  const turnCred = import.meta.env.VITE_TURN_CREDENTIAL;
                  if (turnUrl && turnUser && turnCred) {
                    iceServers.push({ urls: turnUrl, username: turnUser, credential: turnCred });
                  }
                  ppc = new RTCPeerConnection({ iceServers });
                  // Publish local tracks
                  streamRef.current.getTracks().forEach(track => ppc.addTrack(track, streamRef.current));
                  // ICE to viewer
                  ppc.onicecandidate = (ev) => {
                    if (ev.candidate) {
                      signalingChannel.send({ type: 'broadcast', event: 'ice-candidate', payload: { candidate: ev.candidate, viewerId: vid } });
                    }
                  };
                  // Auto cleanup on disconnect
                  ppc.oniceconnectionstatechange = () => {
                    if (["closed","failed","disconnected"].includes(ppc.iceConnectionState)) {
                      try { ppc.close(); } catch {}
                      publisherPeersRef.current.delete(vid);
                    }
                  };
                  publisherPeersRef.current.set(vid, ppc);
                }
                // Offer for that viewer
                const offer = await ppc.createOffer();
                await ppc.setLocalDescription(offer);
                signalingChannel.send({ type: 'broadcast', event: 'offer', payload: { offer, viewerId: vid } });
                log(`publisher sent offer to ${vid}`);
            }
        } catch (error) {
            console.error("Signaling error:", error);
            log(`signaling error: ${error?.message || error}`);
        }
    };
    
    signalingChannel.on('broadcast', { event: 'offer' }, handleSignaling)
                   .on('broadcast', { event: 'answer' }, handleSignaling)
                   .on('broadcast', { event: 'ice-candidate' }, handleSignaling)
                   .on('broadcast', { event: 'request-offer' }, handleSignaling)
                   .subscribe(async (status) => {
                        if (status === 'SUBSCRIBED' && !isPublisher && streamData.status === 'active') {
                            // New viewer, request offer
                            signalingChannel.send({ type: 'broadcast', event: 'request-offer', payload: { viewerId: user?.id || 'guest' } });
                            log('viewer subscribed -> request-offer sent');
                            // Retry mekanizması: 5 sn içinde track gelmezse tekrar iste
                            if (!retryTimerRef.current) {
                              retryTimerRef.current = setTimeout(() => {
                                if (!isStreaming && requestRetries < 3) {
                                  setRequestRetries(prev => prev + 1);
                                  signalingChannel.send({ type: 'broadcast', event: 'request-offer', payload: { viewerId: user?.id || 'guest' } });
                                  log(`retry request-offer #${requestRetries + 1}`);
                                  retryTimerRef.current = null;
                                }
                              }, 5000);
                            }
                        }
                   });
    
    // Publisher logic to respond to offer requests
    // Publisher tarafında request-offer handle'ı yukarıda tanımlandı

    return () => {
      supabase.removeChannel(signalingChannel);
    };
  }, [streamData, isLoading, isPublisher, streamId, user, log, isStreaming, requestRetries]);

  // HLS fallback (opsiyonel) - streamData.hls_url varsa ve izleyici ise
  useEffect(() => {
    const useHls = async () => {
      if (!videoRef.current || !streamData?.hls_url || isPublisher || isStreaming) return;
      try {
        const video = videoRef.current;
        const hlsUrl = streamData.hls_url;
        // Native HLS desteği
        if (video.canPlayType('application/vnd.apple.mpegURL')) {
          video.src = hlsUrl;
          await video.play().catch(() => {});
          setHlsActive(true);
          log('native HLS attached');
          return;
        }
        // hls.js dinamik import
        const { default: Hls } = await import('hls.js');
        if (Hls.isSupported()) {
          const hls = new Hls();
          hlsRef.current = hls;
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
            setHlsActive(true);
            log('hls.js attached');
          });
          hls.on(Hls.Events.ERROR, (_, data) => {
            log(`hls error: ${data?.type || ''} | ${data?.details || ''}`);
          });
        }
      } catch (e) {
        log(`hls setup error: ${e?.message || e}`);
      }
    };
    useHls();
    // cleanup handled in general cleanup
  }, [streamData?.hls_url, isPublisher, isStreaming, log]);

  // Önizleme aktifse video elementine preview stream'i bağla
  useEffect(() => {
    if (previewActive && previewRef.current && videoRef.current && !isStreaming) {
      videoRef.current.srcObject = previewRef.current;
      videoRef.current.muted = true; // önizleme sırasında her zaman mute
    }
  }, [previewActive, isStreaming]);



  const startStream = async () => {
    if (!isPublisher) return;

    // Koleksiyon seçimi kontrolü
    if (!selectedCollection) {
      toast({ title: '⚠️ Önce koleksiyon seç!', description: 'Yayın başlatmak için bir koleksiyon seçmelisin', variant: 'destructive' });
      setShowCollectionSelector(true);
      return;
    }

    try {
      const { data: activeStreams } = await supabase
        .from('streams')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);
      if (activeStreams && activeStreams.length > 0) {
        toast({ title: 'Zaten aktif bir yayının var!', variant: 'destructive' });
        return;
      }
      if (!previewRef.current) {
        // Önizleme yoksa direkt video+audio iste
        previewRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: true });
      }
      // Önizleme varsa, audio yoksa mikrofon eklemeyi dene
      const videoTracks = previewRef.current.getVideoTracks();
      let audioTracks = previewRef.current.getAudioTracks();
      if (audioTracks.length === 0) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioTracks = audioStream.getAudioTracks();
        } catch {
          // mikrofon izin verilmediyse sessiz yayın olur
          audioTracks = [];
        }
      }
      streamRef.current = new MediaStream([...videoTracks, ...audioTracks]);
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.muted = true;
      }
      setIsStreaming(true);
      setPreviewActive(false);
      setStreamEnded(false);
      await supabase.from('streams').update({ status: 'active' }).eq('id', streamId);
      toast({ title: '🎥 Canlı yayın başladı!', description: `${selectedCollection.name} koleksiyonu ile` });
      log('publisher started');
    } catch (error) {
      toast({ title: '❌ İzin gerekli', description: String(error), variant: 'destructive' });
    }
  };

  const stopStream = async () => {
    if (!isPublisher) return;
    
    cleanup();
    
    await supabase.from('streams').update({ status: 'inactive' }).eq('id', streamId);
    toast({ title: "⏹️ Yayın durduruldu" });
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        toast({ title: audioTrack.enabled ? "🔊 Mikrofon açık" : "🔇 Mikrofon kapalı" });
      }
    }
  };

  const toggleViewerMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !viewerMuted;
      setViewerMuted(!viewerMuted);
    }
  };
  
  const reconnect = () => {
    // İzleyici için yeniden bağlanma
    if (isPublisher) return;
    cleanup();
    setRequestRetries(0);
    setIsStreaming(false);
    setViewerMuted(true);
    // Yeni signaling request için kanal yeniden kurulsun
    if (signalingRef.current) {
      supabase.removeChannel(signalingRef.current);
      signalingRef.current = null;
    }
    setTimeout(() => {
      // State değişimi yeni useEffect'i tetikleyecek
      setStreamData(prev => ({ ...prev }));
    }, 100);
  };
    
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Yayın linki kopyalandı!' });
  };

  const toggleOrientation = async () => {
    const next = orientation === 'landscape' ? 'portrait' : 'landscape';
    setOrientation(next);
    toast({ title: `Görüntü: ${next === 'landscape' ? 'Yatay' : 'Dikey'}` });
    // Veritabanına kaydet (izleyiciler realtime alsın)
    if (isPublisher && streamData?.id) {
      await supabase.from('streams').update({ orientation: next }).eq('id', streamData.id);
    }
  };

  // Auction Functions
  const fetchCollections = async () => {
    if (!isPublisher) return;
    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          id, name, description,
          collection_products(product_id, products(*))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const selectCollection = (collection) => {
    setSelectedCollection(collection);
    const products = collection.collection_products?.map(cp => cp.products).filter(Boolean) || [];
    setCollectionProducts(products);
    setShowCollectionSelector(false);
    toast({ title: `📦 ${collection.name} koleksiyonu seçildi`, description: `${products.length} ürün yüklendi` });
  };

  const startAuction = async (productId) => {
    if (!isPublisher || !streamData || !selectedCollection) return;
    try {
      const product = collectionProducts.find(p => p.id === productId);
      if (!product) return;
      
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('auctions')
        .insert({
          stream_id: streamId,
          product_id: productId,
          starting_price: Number(product.price),
          current_price: Number(product.price),
          status: 'active',
          timer_seconds: 30,
          timer_started_at: now
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setActiveAuction(data);
      setShowAuctionPanel(true);
      setTimeRemaining(30);
      toast({ title: '🔨 Açık artırma başladı!', description: `${product.title} - ₺${Number(product.price).toFixed(2)} - 30 saniye` });
    } catch (error) {
      console.error('Error starting auction:', error);
      toast({ title: 'Açık artırma başlatılamadı', variant: 'destructive' });
    }
  };

  const endAuction = async () => {
    if (!isPublisher || !activeAuction) return;
    try {
      const { error } = await supabase
        .from('auctions')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', activeAuction.id);
      
      if (error) throw error;
      
      if (activeAuction.current_winner_id) {
        toast({ title: `🎉 Açık artırma bitti! Kazanan: ${activeAuction.current_winner_id.slice(0, 8)}...` });
      } else {
        toast({ title: '⏹️ Açık artırma teklif almadan bitti' });
      }
      
      setActiveAuction(null);
      setShowAuctionPanel(false);
    } catch (error) {
      console.error('Error ending auction:', error);
      toast({ title: 'Açık artırma bitirilemedi', variant: 'destructive' });
    }
  };

  const placeBid = async (customAmount = null) => {
    if (!user || !activeAuction) return;
    
    // Eğer customAmount verilmişse increment olarak kullan, yoksa input'tan al
    const increment = customAmount !== null ? customAmount : parseFloat(bidAmount);
    
    if (isNaN(increment) || increment <= 0) {
      toast({ title: 'Teklif 0\'dan büyük olmalı', variant: 'destructive' });
      return;
    }
    
    const newPrice = activeAuction.current_price + increment;
    
    try {
      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Anonim';
      
      // Bid ekle
      const { error: bidError } = await supabase
        .from('bids')
        .insert({
          auction_id: activeAuction.id,
          user_id: user.id,
          amount: newPrice,
          increment: increment
        });
      
      if (bidError) throw bidError;
      
      // Auction'ı güncelle
      const { error: auctionError } = await supabase
        .from('auctions')
        .update({ 
          current_price: newPrice,
          current_winner_id: user.id,
          current_winner_username: username
        })
        .eq('id', activeAuction.id);
      
      if (auctionError) throw auctionError;
      
      // Chat'e sistem mesajı gönder
      await supabase
        .from('stream_messages')
        .insert({
          stream_id: streamId,
          user_id: user.id,
          content: `💰 ${username} ₺${newPrice.toFixed(2)} teklif verdi! (+₺${increment.toFixed(2)})`,
          is_system: true
        });
      
      setBidAmount('');
      toast({ title: '✅ Teklif verildi!', description: `₺${newPrice.toFixed(2)}` });
    } catch (error) {
      console.error('Error placing bid:', error);
      toast({ title: 'Teklif verilemedi', variant: 'destructive' });
    }
  };

  const quickBid = (increment) => {
    placeBid(increment);
  };

  // Subscribe to active auction
  useEffect(() => {
    if (!streamData?.id) return;
    
    const fetchActiveAuction = async () => {
      const { data } = await supabase
        .from('auctions')
        .select('*')
        .eq('stream_id', streamData.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (data) {
        setActiveAuction(data);
        setShowAuctionPanel(true);
      } else {
        setActiveAuction(null);
        setShowAuctionPanel(false);
      }
    };
    
    fetchActiveAuction();
    
    // 1 saniyelik polling (realtime yedek)
    const pollingInterval = setInterval(fetchActiveAuction, 1000);
    
    // Realtime subscription for auction updates - instant updates!
    const channel = supabase
      .channel(`auction:${streamData.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'auctions',
        filter: `stream_id=eq.${streamData.id}`
      }, payload => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setActiveAuction(payload.new);
          if (!isPublisher) {
            toast({ 
              title: '💰 Fiyat güncellendi!', 
              description: `Yeni fiyat: ₺${Number(payload.new.current_price).toFixed(2)}`,
              duration: 2000
            });
          }
        } else if (payload.eventType === 'DELETE') {
          setActiveAuction(null);
          setShowAuctionPanel(false);
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bids'
      }, payload => {
        setAuctionBids(prev => [payload.new, ...prev]);
      })
      .subscribe();
    
    setAuctionChannel(channel);
    
    return () => {
      clearInterval(pollingInterval);
      if (channel) supabase.removeChannel(channel);
    };
  }, [streamData?.id]);

  // Auction Timer: 30 saniye geri sayım
  useEffect(() => {
    if (!activeAuction || activeAuction.status !== 'active') return;

    const startTime = activeAuction.timer_started_at 
      ? new Date(activeAuction.timer_started_at).getTime()
      : Date.now();
    
    const duration = (activeAuction.timer_seconds || 30) * 1000;
    
    const timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      
      setTimeRemaining(remaining);
      
      // Süre doldu
      if (remaining === 0) {
        clearInterval(timerInterval);
        handleAuctionEnd();
      }
    }, 100); // Her 100ms'de güncelle (smooth countdown)

    return () => clearInterval(timerInterval);
  }, [activeAuction?.id, activeAuction?.status, activeAuction?.timer_started_at]);

  const handleAuctionEnd = async () => {
    if (!activeAuction) return;

    try {
      // Kazananı belirle (en yüksek teklif sahibi)
      const { data: highestBid } = await supabase
        .from('bids')
        .select('*, profiles:user_id(username, avatar_url)')
        .eq('auction_id', activeAuction.id)
        .order('amount', { ascending: false })
        .limit(1)
        .single();

      if (highestBid) {
        // Auction'ı kapat ve kazananı kaydet
        await supabase
          .from('auctions')
          .update({ 
            status: 'ended', 
            winner_user_id: highestBid.user_id,
            ended_at: new Date().toISOString()
          })
          .eq('id', activeAuction.id);

        setAuctionWinner(highestBid);
        setShowWinnerModal(true);
        
        toast({ 
          title: '🎉 Açık artırma bitti!', 
          description: `Kazanan: ${highestBid.profiles.username} - ₺${highestBid.amount}`
        });
      } else {
        // Teklif yoksa sadece kapat
        await supabase
          .from('auctions')
          .update({ status: 'ended', ended_at: new Date().toISOString() })
          .eq('id', activeAuction.id);
        
        toast({ title: 'Açık artırma sona erdi', description: 'Teklif verilmedi' });
      }
    } catch (error) {
      console.error('Error ending auction:', error);
    }
  };

  const handleConfirmSale = async () => {
    if (!auctionWinner || !activeAuction) return;

    try {
      // Sales kaydı oluştur
      await supabase.from('sales').insert({
        seller_id: streamData.user_id,
        buyer_id: auctionWinner.user_id,
        product_id: activeAuction.product_id,
        auction_id: activeAuction.id,
        final_price: auctionWinner.amount
      });

      // Product'ı satıldı olarak işaretle
      if (activeAuction.product_id) {
        await supabase
          .from('products')
          .update({ 
            is_sold: true, 
            winner_user_id: auctionWinner.user_id 
          })
          .eq('id', activeAuction.product_id);
      }

      setShowWinnerModal(false);
      setActiveAuction(null);
      setShowAuctionPanel(false);
      
      toast({ title: '✅ Satış onaylandı!', description: 'Sonraki ürüne geçebilirsiniz' });
    } catch (error) {
      console.error('Error confirming sale:', error);
      toast({ title: 'Satış kaydedilemedi', variant: 'destructive' });
    }
  };

  const enterPreview = async () => {
    if (!isPublisher) return;
    try {
      let newStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
      } catch {
        try {
          newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: facingMode } }, audio: false });
        } catch {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const desired = facingMode === 'environment';
          const videoInput = devices.find(d => d.kind === 'videoinput' && (desired ? /back|rear|environment/i.test(d.label) : /front|user/i.test(d.label)));
          if (videoInput) {
            newStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: videoInput.deviceId } }, audio: false });
          }
        }
      }
      if (!newStream) throw new Error('Kamera erişimi başarısız');
      if (previewRef.current) previewRef.current.getTracks().forEach(t => t.stop());
      previewRef.current = newStream;
      setPreviewActive(true);
      if (videoRef.current && !isStreaming) {
        videoRef.current.srcObject = newStream;
        videoRef.current.muted = true;
      }
      toast({ title: 'Önizleme açıldı' });
    } catch (e) {
      toast({ title: 'Önizleme açılamadı', description: String(e), variant: 'destructive' });
    }
  };

  const exitPreview = () => {
    if (previewRef.current) {
      previewRef.current.getTracks().forEach(t => t.stop());
      previewRef.current = null;
    }
    setPreviewActive(false);
    if (videoRef.current && !isStreaming) {
      videoRef.current.srcObject = null;
    }
  };

  const switchCamera = async () => {
    if (!isPublisher) return;
    try {
      const desired = facingMode === 'user' ? 'environment' : 'user';
      let newStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: desired } }, audio: false });
      } catch {
        try {
          newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: desired }, audio: false });
        } catch {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInput = devices.find(d => d.kind === 'videoinput' && (desired === 'environment' ? /back|rear|environment/i.test(d.label) : /front|user/i.test(d.label)));
          if (videoInput) {
            newStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: videoInput.deviceId } }, audio: false });
          }
        }
      }
      if (!newStream) {
        toast({ title: 'Kamera değiştirilemedi', variant: 'destructive' });
        return;
      }
      const newVideoTrack = newStream.getVideoTracks()[0];
      if (isStreaming && streamRef.current) {
        const audioTracks = streamRef.current.getAudioTracks();
        const combined = new MediaStream([newVideoTrack, ...audioTracks]);
        streamRef.current.getVideoTracks().forEach(t => t.stop());
        streamRef.current = combined;
        if (videoRef.current) videoRef.current.srcObject = combined;
        publisherPeersRef.current.forEach((ppc) => {
          const sender = ppc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(newVideoTrack);
        });
      } else {
        // Preview modunda sadece önizleme stream'ini değiştir
        if (previewRef.current) previewRef.current.getTracks().forEach(t => t.stop());
        previewRef.current = new MediaStream([newVideoTrack]);
        if (videoRef.current) {
          videoRef.current.srcObject = previewRef.current;
          videoRef.current.muted = true;
        }
      }
      setFacingMode(desired);
      toast({ title: desired === 'environment' ? 'Arka kamera' : 'Ön kamera' });
    } catch (e) {
      toast({ title: 'Kamera değiştirme hatası', description: String(e), variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="bg-gray-50 p-6 flex flex-col items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-[#FFDE59]" /></div>;
  }
  if (streamEnded) {
    return <div className="bg-gray-50 p-6 flex flex-col items-center justify-center"><p className="text-lg text-gray-600">Yayın sona erdi.</p></div>;
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Collection Products */}
      {isPublisher && selectedCollection && collectionProducts.length > 0 && (
        <div className="w-[280px] bg-white border-r border-gray-200 overflow-y-auto p-4">
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-1">{selectedCollection.name}</h3>
            <p className="text-xs text-gray-500">{collectionProducts.length} ürün</p>
          </div>
          <div className="space-y-3">
            {collectionProducts.map(product => {
              const isActive = activeAuction?.product_id === product.id;
              const hasActiveAuction = activeAuction && activeAuction.status === 'active';
              
              return (
              <div
                key={product.id}
                className={`border rounded-lg p-3 transition-colors ${
                  isActive 
                    ? 'border-purple-500 bg-purple-50' 
                    : hasActiveAuction 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-purple-500 cursor-pointer'
                }`}
                onClick={() => !hasActiveAuction && !isActive && startAuction(product.id)}
              >
                {product.image_url && (
                  <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <h4 className="font-semibold text-sm line-clamp-2 mb-1">{product.title}</h4>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-purple-600 font-bold text-sm">₺{Number(product.price).toFixed(2)}</span>
                  <Button 
                    size="sm" 
                    variant={isActive ? "default" : "outline"}
                    className="text-xs h-7 px-2"
                    disabled={hasActiveAuction && !isActive}
                  >
                    <Gavel className="h-3 w-3 mr-1" />
                    {isActive ? 'Satışta' : 'Başlat'}
                  </Button>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-2 sm:p-6 flex flex-col items-center justify-center relative overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl"
      >
        <div 
          className="relative bg-black rounded-lg sm:rounded-2xl overflow-hidden mx-auto"
          style={{ 
            aspectRatio: orientation === 'portrait' ? '9 / 16' : '16 / 9',
            maxHeight: orientation === 'portrait' ? '85vh' : 'none',
            width: orientation === 'portrait' ? 'auto' : '100%'
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isPublisher || viewerMuted}
            className="w-full h-full object-contain"
          />

          {!isStreaming && streamData?.status !== 'active' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white px-4">
              {isPublisher ? (
                !previewActive ? (
                  <>
                    <p className="text-base sm:text-lg text-center">Önizleme başlat ve ayarları seç</p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4">
                      <Button onClick={enterPreview} variant="secondary" className="rounded-full min-h-[44px] w-full sm:w-auto">Önizleme</Button>
                      <Button onClick={startStream} size="lg" className="rounded-full bg-[#FFDE59] text-gray-900 hover:bg-[#FFD700] px-6 py-3 sm:py-5 text-base sm:text-lg font-semibold min-h-[44px] w-full sm:w-auto">
                        <Video className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> Yayını Direkt Başlat
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-base sm:text-lg text-center">Önizleme Aktif - Yayına geç</p>
                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto px-4">
                      <Button onClick={startStream} size="lg" className="rounded-full bg-[#FFDE59] text-gray-900 hover:bg-[#FFD700] px-6 py-3 sm:py-5 text-base sm:text-lg font-semibold min-h-[44px] w-full sm:w-auto">
                        <Video className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> Canlı Yayın Başlat
                      </Button>
                      <Button onClick={toggleOrientation} variant="secondary" className="rounded-full min-h-[44px] w-full sm:w-auto">
                        {orientation === 'landscape' ? 'Dikey Görüntü' : 'Yatay Görüntü'}
                      </Button>
                      <Button onClick={switchCamera} variant="secondary" className="rounded-full min-h-[44px] w-full sm:w-auto">
                        {facingMode === 'user' ? 'Arka Kamera' : 'Ön Kamera'}
                      </Button>
                      <Button onClick={exitPreview} variant="ghost" className="rounded-full text-white/70 hover:text-white min-h-[44px] w-full sm:w-auto">İptal</Button>
                    </div>
                  </>
                )
              ) : (
                <>
                  <Camera className="w-16 h-16 text-gray-600" />
                  <p className="text-gray-400 text-lg">Yayın henüz başlamadı...</p>
                </>
              )}
            </div>
          )}
          
          {isStreaming && isPublisher && (
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex gap-2">
              <Button onClick={toggleMute} size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 h-10 w-10 sm:h-9 sm:w-9">{isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}</Button>
              <Button onClick={copyLink} size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 h-10 w-10 sm:h-9 sm:w-9"><LinkIcon className="h-5 w-5" /></Button>
            </div>
          )}

          {/* İzleyici ses açma */}
          {isStreaming && !isPublisher && viewerMuted && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Button onClick={toggleViewerMute} className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-2 text-base">Sesi Aç</Button>
            </div>
          )}

          {/* İzleyici için yeniden bağlanma butonu */}
          {!isPublisher && streamData?.status === 'active' && !isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={reconnect} className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">Bağlantıyı Yeniden Dene</Button>
            </div>
          )}

          {/* Diagnostik panel opsiyonel */}
          {debugEnabled && (
            <div className="absolute top-4 right-4 text-xs text-white/90 bg-black/40 rounded-md p-2 space-y-1">
              <div><span className="opacity-70">signaling:</span> {sigState}</div>
              <div><span className="opacity-70">conn:</span> {connState}</div>
              <div><span className="opacity-70">ice:</span> {iceConnState} / {iceGatherState}</div>
              <div><span className="opacity-70">mode:</span> {isPublisher ? 'publisher' : 'viewer'}{hlsActive ? ' + HLS' : ''}</div>
              {!isPublisher && <Button size="xs" variant="secondary" onClick={reconnect}>Yeniden Bağlan</Button>}
              {logs.length > 0 && (
                <div className="mt-2 max-h-40 overflow-auto bg-black/50 p-2 rounded">
                  {logs.slice(0,30).map((l, i) => (<div key={i} className="whitespace-pre-wrap opacity-90">{l}</div>))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video altı kontrol şeridi (publisher) */}
        {isStreaming && isPublisher && (
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-4 px-2">
            <Button onClick={endStreamManually} className="rounded-full bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto min-h-[44px]">
              <VideoOff className="w-5 h-5 mr-2" /> Yayını Bitir
            </Button>
            <Button onClick={toggleOrientation} variant="secondary" className="rounded-full w-full sm:w-auto min-h-[44px]">
              {orientation === 'landscape' ? 'Dikey Görüntü' : 'Yatay Görüntü'}
            </Button>
            <Button onClick={switchCamera} variant="secondary" className="rounded-full w-full sm:w-auto min-h-[44px]">
              {facingMode === 'user' ? 'Arka Kameraya Geç' : 'Ön Kameraya Geç'}
            </Button>
            <Button 
              onClick={() => {
                if (activeAuction) {
                  setShowAuctionPanel(true);
                } else if (selectedCollection && collectionProducts.length > 0) {
                  // Koleksiyon seçiliyse direkt ürün panelini aç (sol tarafta zaten görünüyor)
                  toast({ title: 'Sol panelden ürün seç', description: 'Açık artırma başlatmak için bir ürüne tıkla' });
                } else {
                  fetchCollections();
                  setShowCollectionSelector(true);
                }
              }} 
              variant="secondary" 
              className="rounded-full w-full sm:w-auto min-h-[44px] bg-purple-600 text-white hover:bg-purple-700"
            >
              <Gavel className="w-5 h-5 mr-2" />
              {activeAuction ? 'Açık Artırma' : selectedCollection ? 'Ürün Seç' : 'Koleksiyon Seç'}
            </Button>
          </div>
        )}

        {/* Auction Panel for Viewers */}
        {showAuctionPanel && activeAuction && !isPublisher && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Gavel className="h-5 w-5 text-purple-600" />
                Açık Artırma
              </h3>
              <Button size="icon" variant="ghost" onClick={() => setShowAuctionPanel(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Mevcut Fiyat</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${timeRemaining <= 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className={`text-sm font-bold ${timeRemaining <= 10 ? 'text-red-600' : 'text-gray-700'}`}>
                      {timeRemaining}s
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-purple-600">₺{Number(activeAuction.current_price).toFixed(2)}</p>
                {activeAuction.current_winner_username && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xs">👑</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      {activeAuction.current_winner_id === user?.id 
                        ? <span className="text-green-600">Siz öndesiniz! 🏆</span>
                        : <span>{activeAuction.current_winner_username}</span>
                      }
                    </p>
                  </div>
                )}
              </div>
              
              {/* Quick Bid Buttons */}
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => quickBid(25)} 
                  variant="outline"
                  className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  +₺25
                </Button>
                <Button 
                  onClick={() => quickBid(50)} 
                  variant="outline"
                  className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  +₺50
                </Button>
                <Button 
                  onClick={() => quickBid(100)} 
                  variant="outline"
                  className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  +₺100
                </Button>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  placeholder="Özel tutar"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                />
                <Button onClick={() => placeBid()} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Gönder
                </Button>
              </div>
              {auctionBids.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  <p className="text-xs font-medium text-gray-600 mb-1">Son Teklifler</p>
                  {auctionBids.slice(0, 10).map((bid, idx) => (
                    <div key={bid.id || idx} className="text-xs bg-gray-50 rounded p-2 flex justify-between">
                      <span>{bid.user_id === user?.id ? 'Siz' : bid.user_id.slice(0, 8) + '...'}</span>
                      <span className="font-semibold">₺{Number(bid.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Auction Control Panel for Publisher */}
        {showAuctionPanel && activeAuction && isPublisher && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Gavel className="h-5 w-5 text-purple-600" />
                Açık Artırma Kontrol
              </h3>
              <Button size="icon" variant="ghost" onClick={() => setShowAuctionPanel(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Mevcut Fiyat</p>
                <p className="text-2xl font-bold text-purple-600">₺{Number(activeAuction.current_price).toFixed(2)}</p>
                {activeAuction.current_winner_id && (
                  <p className="text-xs text-gray-500 mt-1">Lider: {activeAuction.current_winner_id.slice(0, 8)}...</p>
                )}
              </div>
              <Button onClick={endAuction} className="w-full bg-red-600 hover:bg-red-700 text-white">
                Açık Artırmayı Bitir
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Collection Selector Dialog */}
      <Dialog open={showCollectionSelector} onOpenChange={setShowCollectionSelector}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Koleksiyon Seç</DialogTitle>
            <DialogDescription>
              Canlı yayında satmak istediğiniz ürün koleksiyonunu seçin
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {collections.length === 0 ? (
              <p className="text-gray-500 col-span-2 text-center py-8">
                Henüz koleksiyon yok. Profil sayfanızdan koleksiyon oluşturun.
              </p>
            ) : (
              collections.map(collection => (
                <div
                  key={collection.id}
                  className="p-4 border rounded-lg hover:border-purple-500 cursor-pointer transition-colors"
                  onClick={() => selectCollection(collection)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{collection.name}</h4>
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  {collection.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{collection.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{collection.collection_products?.length || 0} ürün</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Winner Modal */}
      <Dialog open={showWinnerModal} onOpenChange={setShowWinnerModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-3xl">🎉</span>
              Açık Artırma Sonuçlandı!
            </DialogTitle>
            <DialogDescription>
              {auctionWinner && (
                <div className="mt-4 space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Kazanan</p>
                    <p className="text-xl font-bold text-gray-900">
                      {auctionWinner.profiles?.username || 'Kullanıcı'}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Kazanan Teklif</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₺{Number(auctionWinner.amount).toFixed(2)}
                    </p>
                  </div>
                  {isPublisher && (
                    <div className="pt-4 space-y-2">
                      <Button 
                        onClick={handleConfirmSale}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Satışı Onayla ve Kaydet
                      </Button>
                      <Button 
                        onClick={() => setShowWinnerModal(false)}
                        variant="outline"
                        className="w-full"
                      >
                        Daha Sonra
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default LiveStream;