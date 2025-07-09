// src/components/VideoContainer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { wsEndpoint } from '../utils/constants';
import { createPeer, addPeer } from '../utils/peerManager';
import Video from './Video';

export default function VideoContainer() {
  const [peers, setPeers] = useState([]); // [{ peerID, peer }]
  const socketRef = useRef();
  const localStreamRef = useRef();

  useEffect(() => {
    // Protege acesso a mediaDevices
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          userVideo.current.srcObject = stream;
        })
        .catch((err) => console.error('Error getting media:', err));
    } else {
      console.warn('navigator.mediaDevices.getUserMedia não está disponível.');
    }
  }, []);

  return (
    <div className="video-container">
      {peers.map(({ peerID, peer, stream }) => (
        <Video key={peerID} peer={peer} />
      ))}
    </div>
  );
}
