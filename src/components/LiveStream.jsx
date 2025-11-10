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

  const [streamData, setStreamData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isPublisher = user && streamData && user.id === streamData.user_id;

  // Cleanup function
  const cleanup = useCallback(() => {
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
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        peerConnectionRef.current = pc;

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                signalingChannel.send({
                    type: 'broadcast',
                    event: 'ice-candidate',
                    payload: { candidate: event.candidate },
                });
            }
        };

        pc.ontrack = (event) => {
            if (videoRef.current) {
                videoRef.current.srcObject = event.streams[0];
                setIsStreaming(true);
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
            } else if (event === 'answer' && isPublisher) {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
            } else if (event === 'ice-candidate') {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            }
        } catch (error) {
            console.error("Signaling error:", error);
        }
    };
    
    signalingChannel.on('broadcast', { event: 'offer' }, handleSignaling)
                   .on('broadcast', { event: 'answer' }, handleSignaling)
                   .on('broadcast', { event: 'ice-candidate' }, handleSignaling)
                   .subscribe(async (status) => {
                        if (status === 'SUBSCRIBED' && !isPublisher && streamData.status === 'active') {
                            // New viewer, request offer
                             signalingChannel.send({ type: 'broadcast', event: 'request-offer', payload: { viewerId: user?.id || 'guest' } });
                        }
                   });
    
    // Publisher logic to respond to offer requests
    if (isPublisher) {
        signalingChannel.on('broadcast', { event: 'request-offer' }, async () => {
            if (streamRef.current && pc.signalingState === "stable") {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                signalingChannel.send({ type: 'broadcast', event: 'offer', payload: { offer } });
            }
        }).subscribe();
    }

    return () => {
      supabase.removeChannel(signalingChannel);
    };
  }, [streamData, isLoading, isPublisher, streamId, user]);


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
        </div>
      </motion.div>
    </div>
  );
};

export default LiveStream;