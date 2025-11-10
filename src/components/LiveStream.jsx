import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, Camera, Loader2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const LiveStream = ({ streamId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const videoRef = useRef(null);
  // Tek izleyici için kullanılan PC (izleyici cihazındayken)
  const peerConnectionRef = useRef(null);
  // Publisher iken her izleyici için ayrı RTCPeerConnection tut
  const publisherPeersRef = useRef(new Map()); // viewerId -> RTCPeerConnection
  const signalingRef = useRef(null);
  const streamRef = useRef(null);
  const hlsRef = useRef(null);
  const retryTimerRef = useRef(null);

  const [streamData, setStreamData] = useState(null);
  const [streamEnded, setStreamEnded] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerMuted, setViewerMuted] = useState(true);

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

  const isPublisher = user && streamData && user.id === streamData.user_id;

  // Route / sayfa değişiminde yayıncıyı uyarmak için hafif mekanizma
  useEffect(() => {
    if (!isPublisher || !isStreaming) return;
    const beforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    const popHandler = (e) => {
      const ok = window.confirm('Yayını sona erdireceksiniz. Emin misiniz?');
      if (!ok) {
        // İptal: ileri bir state push ederek geri hareketi nötrle
        history.pushState(null, '', window.location.href);
      } else {
        // Akış sonlandır
        if (streamData?.id) {
          supabase.from('streams').update({ status: 'ended' }).eq('id', streamData.id);
        }
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('popstate', popHandler);
    // Geri tuşunu yakalamak için ekstra bir state push
    history.pushState(null, '', window.location.href);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('popstate', popHandler);
    };
  }, [isPublisher, isStreaming, streamData?.id]);

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
        .select('id, user_id, title, status, stream_url, created_at, updated_at')
        .eq('id', streamId)
        .single();
      if (error || !data) {
        toast({ title: 'Yayın bulunamadı!', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      setStreamData(data);
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
        if (payload.new.status === 'ended') {
          setStreamEnded(true);
          toast({ title: 'Yayın sona erdi.' });
          cleanup();
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


  const startStream = async () => {
    if (!isPublisher) return;

    try {
      // Aynı user için aktif stream var mı kontrol et
      const { data: activeStreams, error: activeError } = await supabase
        .from('streams')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);
      if (activeStreams && activeStreams.length > 0) {
        toast({ title: 'Zaten aktif bir yayının var!', variant: 'destructive' });
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true;
      }
      setIsStreaming(true);
      setStreamEnded(false); // Yayın başlayınca ended flag'ini temizle
      await supabase.from('streams').update({ status: 'active' }).eq('id', streamId);
      toast({ title: "🎥 Canlı yayın başladı!" });
      log('publisher started local preview (offers per viewer on request)');
    } catch (error) {
      toast({ title: "❌ İzin gerekli", description: "Kamera ve mikrofon izni vermelisiniz!", variant: "destructive" });
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
    toast({title: "Yayın linki kopyalandı!"});
  }

  if (isLoading) {
    return <div className="bg-gray-50 p-6 flex flex-col items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-[#FFDE59]" /></div>;
  }
  if (streamEnded) {
    return <div className="bg-gray-50 p-6 flex flex-col items-center justify-center"><p className="text-lg text-gray-600">Yayın sona erdi.</p></div>;
  }

  return (
    <div className="bg-gray-50 p-6 flex flex-col items-center justify-center relative">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl"
      >
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isPublisher || viewerMuted}
            className="w-full h-full object-cover"
          />

          {!isStreaming && streamData?.status !== 'active' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
              {isPublisher ? (
                <>
                  <p className="text-lg">Yayına Başlamaya Hazır</p>
                  <Button onClick={startStream} size="lg" className="rounded-full bg-[#FFDE59] text-gray-900 hover:bg-[#FFD700] px-8 py-6 text-lg font-semibold">
                    <Video className="w-6 h-6 mr-2" />
                    Canlı Yayın Başlat
                  </Button>
                </>
              ) : (
                <>
                  <Camera className="w-16 h-16 text-gray-600" />
                  <p className="text-gray-400 text-lg">Yayın henüz başlamadı...</p>
                </>
              )}
            </div>
          )}
          
          {isStreaming && isPublisher && (
            <>
              <div className="absolute top-4 left-4 flex gap-2">
                <Button onClick={toggleMute} size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">{isMuted ? <MicOff /> : <Mic />}</Button>
                <Button onClick={copyLink} size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"><LinkIcon /></Button>
              </div>
              {/* Büyük ve belirgin Yayını Bitir butonu */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                <Button onClick={endStreamManually} size="lg" className="rounded-full bg-red-600 text-white px-8 py-6 text-xl font-bold shadow-lg hover:bg-red-700">
                  <VideoOff className="w-7 h-7 mr-3" />
                  Yayını Bitir
                </Button>
              </div>
            </>
          )}

          {/* İzleyici ses açma */}
          {isStreaming && !isPublisher && viewerMuted && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Button onClick={toggleViewerMute} size="sm" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">Sesi Aç</Button>
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
      </motion.div>
    </div>
  );
};

export default LiveStream;