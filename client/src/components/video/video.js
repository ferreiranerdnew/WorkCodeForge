import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
// import { JOIN_VIDEO } from './actions'; // <- Você deve importar isso corretamente

const Container = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  margin: 20px;
`;

const StyledVideo = styled.video`
  height: 200px;
  width: 300px;
  margin: 10px;
  border-radius: 8px;
  background: #333;
`;

const ErrorMessage = styled.div`
  color: red;
  padding: 20px;
  text-align: center;
  border: 1px solid red;
  border-radius: 5px;
  margin: 10px;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #007bff;
  color: white;
  
  &:hover {
    background: #0056b3;
  }
  
  &.danger {
    background: #dc3545;
  }
  
  &.danger:hover {
    background: #c82333;
  }
`;

const StatusIndicator = styled.div`
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  margin: 5px;
  
  &.success {
    background: #d4edda;
    color: #155724;
  }
  
  &.warning {
    background: #fff3cd;
    color: #856404;
  }
`;

function Video({ peer }) {
  const ref = useRef();

  useEffect(() => {
    peer.on('stream', (stream) => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return <StyledVideo playsInline autoPlay ref={ref} />;
}

function VideoContainer() {
  const [peers, setPeers] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [streamType, setStreamType] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const userVideo = useRef();
  const streamRef = useRef();
  const dispatch = useDispatch();

  // Função para verificar se a API está disponível
  const checkMediaDevicesSupport = () => {
    console.log('Verificando suporte à API de mídia...');
    
    if (!navigator.mediaDevices) {
      console.warn('navigator.mediaDevices não disponível');
      return false;
    }
    
    if (!navigator.mediaDevices.getUserMedia) {
      console.warn('navigator.mediaDevices.getUserMedia não disponível');
      return false;
    }
    
    console.log('API de mídia suportada');
    return true;
  };

  // Função para criar um stream de teste (mock)
  const createMockStream = () => {
    console.log('Criando stream mock para teste');
    
    // Cria um canvas para simular vídeo
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    // Animação simples para o mock
    let frame = 0;
    const animate = () => {
      // Fundo colorido com gradiente
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#4CAF50');
      gradient.addColorStop(1, '#2E7D32');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Texto principal
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TESTE - Video Mock', canvas.width / 2, canvas.height / 2 - 40);
      
      // Subtítulo
      ctx.font = '20px Arial';
      ctx.fillText('Ambiente de Desenvolvimento', canvas.width / 2, canvas.height / 2 + 10);
      
      // Indicador de "gravação"
      ctx.fillStyle = frame % 60 < 30 ? '#ff4444' : '#ffffff';
      ctx.beginPath();
      ctx.arc(50, 50, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('REC', 70, 55);
      
      // Timestamp
      ctx.textAlign = 'right';
      ctx.fillText(new Date().toLocaleTimeString(), canvas.width - 20, 30);
      
      frame++;
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Converte canvas para stream
    const stream = canvas.captureStream(30); // 30 FPS
    
    // Simula áudio (silencioso)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const destination = audioContext.createMediaStreamDestination();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(destination);
    gain.gain.value = 0; // Silencioso
    oscillator.frequency.value = 440;
    oscillator.start();
    
    // Adiciona track de áudio ao stream
    destination.stream.getAudioTracks().forEach(track => {
      stream.addTrack(track);
    });
    
    return stream;
  };

  // Função para obter o stream de mídia
  const getMediaStream = async () => {
    console.log('getMediaStream: Iniciando');
    try {
      setIsLoading(true);
      setError(null);

      // Verificar se a API está disponível
      if (!checkMediaDevicesSupport()) {
        console.warn('API de mídia não suportada - usando mock para teste');
        const mockStream = createMockStream();
        streamRef.current = mockStream;
        
        if (userVideo.current) {
          userVideo.current.srcObject = mockStream;
          console.log('Stream mock aplicado ao vídeo');
        }
        
        setStreamType('mock');
        setIsActive(true);
        // dispatch(JOIN_VIDEO()); // Descomente se estiver definida
        return;
      }

      // Em ambiente de teste, tenta primeiro getUserMedia, se falhar usa mock
      try {
        console.log('Tentando acessar getUserMedia...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: videoEnabled, 
          audio: audioEnabled 
        });
        
        streamRef.current = stream;
        
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
          console.log('Stream real aplicado ao vídeo');
        }
        
        setStreamType('real');
        setIsActive(true);
        // dispatch(JOIN_VIDEO()); // Descomente se estiver definida
        
      } catch (mediaError) {
        console.warn('Erro ao acessar mídia real, usando mock:', mediaError);
        
        // Se falhar, usa stream mock para testes
        const mockStream = createMockStream();
        streamRef.current = mockStream;
        
        if (userVideo.current) {
          userVideo.current.srcObject = mockStream;
          console.log('Stream mock aplicado após falha da mídia real');
        }
        
        setStreamType('mock');
        setIsActive(true);
        // dispatch(JOIN_VIDEO()); // Descomente se estiver definida
      }
      
    } catch (err) {
      console.error('Erro geral:', err);
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro ao acessar câmera e microfone';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Acesso à câmera e microfone negado. Permita o acesso nas configurações do navegador.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Câmera ou microfone não encontrados.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Câmera ou microfone não suportados neste navegador.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('getMediaStream: Finalizado');
    }
  };

  // Função para parar o stream
  const stopStream = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        track.stop();
        console.log('Track parada:', track.kind);
      });
    }
    
    if (userVideo.current) {
      userVideo.current.srcObject = null;
    }
    
    streamRef.current = null;
    setIsActive(false);
    setStreamType(null);
  };

  // Função para alternar áudio
  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  // Função para alternar vídeo
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  useEffect(() => {
    console.log('VideoContainer: Iniciando useEffect');
    
    const initializeMedia = async () => {
      await getMediaStream();
    };
    
    initializeMedia();
    
    // Cleanup function para parar o stream quando o componente for desmontado
    return () => {
      console.log('VideoContainer: Cleanup executado');
      const stream = streamRef.current;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => {
          track.stop();
          console.log('Track parada no cleanup:', track.kind);
        });
      }
    };
  }, []); // getMediaStream não precisa estar na dependência pois não muda

  // Função para tentar novamente
  const handleRetry = () => {
    getMediaStream();
  };

  if (isLoading) {
    return (
      <Container>
        <div style={{ color: 'white' }}>Carregando acesso à câmera e microfone...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          <h3>Erro de Mídia</h3>
          <p>{error}</p>
          <Button onClick={handleRetry}>Tentar Novamente</Button>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      {streamType && (
        <StatusIndicator className={streamType === 'real' ? 'success' : 'warning'}>
          {streamType === 'real' ? '🟢 Mídia Real Ativa' : '🟡 Modo Teste/Mock'}
        </StatusIndicator>
      )}
      
      <StyledVideo 
        muted={streamType === 'real'} // Só mutado se for stream real para evitar feedback
        ref={userVideo} 
        autoPlay 
        playsInline 
      />
      
      <Controls>
        <Button 
          onClick={toggleAudio}
          style={{ background: audioEnabled ? '#28a745' : '#dc3545' }}
        >
          {audioEnabled ? '🔊 Áudio On' : '🔇 Áudio Off'}
        </Button>
        
        <Button 
          onClick={toggleVideo}
          style={{ background: videoEnabled ? '#28a745' : '#dc3545' }}
        >
          {videoEnabled ? '📹 Vídeo On' : '📷 Vídeo Off'}
        </Button>
        
        <Button className="danger" onClick={stopStream}>
          ⏹️ Parar
        </Button>
      </Controls>
      
      {peers.map((peer, index) => (
        <Video key={index} peer={peer} />
      ))}
    </Container>
  );
}

export default VideoContainer;