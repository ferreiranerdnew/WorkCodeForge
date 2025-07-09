import Peer from 'simple-peer';

/**
 * Quem inicia a chamada cria um peer no modo `initiator`
 */
export function createPeer(userToSignal, callerID, stream, socket) {
  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
  });

  peer.on('signal', (signal) => {
    socket.emit('sending-signal', { userToSignal, callerID, signal });
  });

  return peer;
}

/**
 * Quem recebe a oferta adiciona o peer e responde com `signal`
 */
export function addPeer({ signal, callerID }, stream, socket) {
  const peer = new Peer({
    initiator: false,
    trickle: false,
    stream,
  });

  peer.on('signal', (returnSignal) => {
    socket.emit('returning-signal', { signal: returnSignal, callerID });
  });

  peer.signal(signal);
  return peer;
}
