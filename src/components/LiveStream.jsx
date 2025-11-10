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
  const peerConnectionRef = useRef(null);
  const streamRef = useRef(null);
  const hlsRef = useRef(null);
  const retryTimerRef = useRef(null);

  const [streamData, setStreamData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerMuted, setViewerMuted] = useState(true);

  // Debug/diagnostic states
  const [connState, setConnState] = useState('new');
  const [sigState, setSigState] = useState('stable');
  const [iceConnState, setIceConnState] = useState('new');
  const [iceGatherState, setIceGatherState] = useState('new');
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [hlsActive, setHlsActive] = useState(false);
  const [requestRetries, setRequestRetries] = useState(0);

  const isPublisher = user && streamData && user.id === streamData.user_id;

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
  }, []);

  const log = useCallback((msg) => {
    const line = `${new Date().toLocaleTimeString()} | ${msg}`;
    setLogs(prev => [line, ...prev].slice(0, 200));
    // console.log(line);
  }, []);

  useEffect(() => {
    const fetchStreamData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('streams')
        .select('*')
        .eq('id', streamId)
        .single();
      
      if (error || !data) {
        toast({ title: 'Yayın bulunamadı!', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      setStreamData(data);
      setIsLoading(false);
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

  // WebRTC Logic
  useEffect(() => {
    if (!streamData || isLoading) return;

    const signalingChannel = supabase.channel(`signaling-${streamId}`);

    const setupPeerConnection = () => {
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
        if (!pc) return;

        try {
            if (event === 'offer' && !isPublisher) {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                signalingChannel.send({ type: 'broadcast', event: 'answer', payload: { answer } });
                log('received offer -> sent answer');
            } else if (event === 'answer' && isPublisher) {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
                log('publisher received answer');
            } else if (event === 'ice-candidate') {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
                log('received ice-candidate');
            }
        } catch (error) {
            console.error("Signaling error:", error);
            log(`signaling error: ${error?.message || error}`);
        }
    };
    
    signalingChannel.on('broadcast', { event: 'offer' }, handleSignaling)
                   .on('broadcast', { event: 'answer' }, handleSignaling)
                   .on('broadcast', { event: 'ice-candidate' }, handleSignaling)
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
    if (isPublisher) {
        signalingChannel.on('broadcast', { event: 'request-offer' }, async () => {
            if (streamRef.current && pc.signalingState === "stable") {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                signalingChannel.send({ type: 'broadcast', event: 'offer', payload: { offer } });
                log('publisher created and sent offer');
            }
        }).subscribe();
    }

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
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = mediaStream;
      
      mediaStream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, mediaStream);
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true; // Mute self-view
      }

      setIsStreaming(true);
      
      await supabase.from('streams').update({ status: 'active' }).eq('id', streamId);

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      const signalingChannel = supabase.channel(`signaling-${streamId}`);
      signalingChannel.send({
        type: 'broadcast',
        event: 'offer',
        payload: { offer },
      });

      toast({ title: "🎥 Canlı yayın başladı!" });
      log('publisher created initial offer');
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
    setTimeout(() => {
      setRequestRetries(0);
      setIsStreaming(false);
      setViewerMuted(true);
      // state değişimleri yeni effect'i tetikleyecek
    }, 50);
  };
    
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({title: "Yayın linki kopyalandı!"});
  }

  if (isLoading) {
    return <div className="bg-gray-50 p-6 flex flex-col items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-[#FFDE59]" /></div>;
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
            <div className="absolute top-4 left-4 flex gap-2">
               <Button onClick={toggleMute} size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">{isMuted ? <MicOff /> : <Mic />}</Button>
               <Button onClick={stopStream} size="icon" className="rounded-full bg-red-500/80 backdrop-blur-sm hover:bg-red-600/80"><VideoOff /></Button>
               <Button onClick={copyLink} size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"><LinkIcon /></Button>
            </div>
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

          {/* Diagnostik panel */}
          <div className="absolute top-4 right-4 text-xs text-white/90 bg-black/40 rounded-md p-2 space-y-1">
            <div><span className="opacity-70">signaling:</span> {sigState}</div>
            <div><span className="opacity-70">conn:</span> {connState}</div>
            <div><span className="opacity-70">ice:</span> {iceConnState} / {iceGatherState}</div>
            <div><span className="opacity-70">mode:</span> {isPublisher ? 'publisher' : 'viewer'}{hlsActive ? ' + HLS' : ''}</div>
            <div className="flex gap-2">
              <Button size="xs" variant="secondary" onClick={() => setShowLogs(s => !s)}>Loglar</Button>
              {!isPublisher && <Button size="xs" variant="secondary" onClick={reconnect}>Yeniden Bağlan</Button>}
            </div>
            {showLogs && (
              <div className="mt-2 max-h-40 overflow-auto bg-black/50 p-2 rounded">
                {logs.slice(0,30).map((l, i) => (<div key={i} className="whitespace-pre-wrap opacity-90">{l}</div>))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveStream;