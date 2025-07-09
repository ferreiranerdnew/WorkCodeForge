// src/middleware/socketRTK.js
import { wsEndpoint } from '../utils/constants';
import { io } from 'socket.io-client';
import { createPeer, addPeer } from '../utils/peerManager';
import {
  SET_VIDEO_PARTICIPANTS,
  SET_SOCKETID,
  USER_DISCONNECT,
} from '../reducers/mapReducer_old';

// Definir as novas ações aqui até serem adicionadas ao mapReducer
const SET_ONLINE_USERS = 'SET_ONLINE_USERS';
const ADD_ONLINE_USER = 'ADD_ONLINE_USER';
const REMOVE_ONLINE_USER = 'REMOVE_ONLINE_USER';
const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE';
const RECEIVE_PRIVATE_MESSAGE = 'RECEIVE_PRIVATE_MESSAGE';
const UPDATE_USER_STATUS = 'UPDATE_USER_STATUS';
const RECEIVE_TYPING_STATUS = 'RECEIVE_TYPING_STATUS';
const RECEIVE_USER_JOINED = 'RECEIVE_USER_JOINED';
const RECEIVE_USER_LEFT = 'RECEIVE_USER_LEFT';

export const socketRTK = () => {
  return (storeAPI) => {
    const socket = io(wsEndpoint, { transports: ['websocket'] });
    const peers = {}; // socketId => Peer instance
    
    // Armazena o socket ID no Redux
    socket.on('connect', () => {
      storeAPI.dispatch(SET_SOCKETID({ id: socket.id }));
      
      // Indica ao servidor que deseja participar da sala de vídeo
      socket.emit('joinVideo');
      
      // Solicita lista de usuários online
      socket.emit('requestOnlineUsers');
      
      // Emite status de usuário conectado
      socket.emit('userStatus', { 
        status: 'online', 
        userId: socket.id,
        timestamp: Date.now()
      });
    });

    // === EVENTOS DE VÍDEO ===
    // Recebe lista de participantes de vídeo
    socket.on('userList', (users) => {
      if (Array.isArray(users)) {
        storeAPI.dispatch(SET_VIDEO_PARTICIPANTS(users));
      }
    });

    // Quando um novo usuário inicia um peer com você
    socket.on('sending-signal', ({ userToSignal, callerID, signal }) => {
      const peer = addPeer({ signal, callerID }, storeAPI.getState().video.localStream, socket);
      peers[callerID] = peer;
    });

    // Quando um usuário retorna sinal
    socket.on('returning-signal', ({ callerID, signal }) => {
      const peer = peers[callerID];
      if (peer) peer.signal(signal);
    });

    // === EVENTOS DE USUÁRIOS ONLINE ===
    // Lista completa de usuários online
    socket.on('onlineUsers', (users) => {
      storeAPI.dispatch({ type: SET_ONLINE_USERS, payload: users });
    });

    // Novo usuário entrou online
    socket.on('userJoined', (user) => {
      storeAPI.dispatch({ type: ADD_ONLINE_USER, payload: user });
      storeAPI.dispatch({ 
        type: RECEIVE_USER_JOINED, 
        payload: {
          message: `${user.name || user.id} entrou na plataforma`,
          userId: user.id,
          timestamp: Date.now()
        }
      });
    });

    // Usuário saiu
    socket.on('userLeft', (user) => {
      storeAPI.dispatch({ type: REMOVE_ONLINE_USER, payload: user.id });
      storeAPI.dispatch({ 
        type: RECEIVE_USER_LEFT, 
        payload: {
          message: `${user.name || user.id} saiu da plataforma`,
          userId: user.id,
          timestamp: Date.now()
        }
      });
    });

    // Status de usuário atualizado
    socket.on('userStatusUpdate', ({ userId, status, lastSeen }) => {
      storeAPI.dispatch({ 
        type: UPDATE_USER_STATUS, 
        payload: { userId, status, lastSeen }
      });
    });

    // === EVENTOS DE MENSAGENS ===
    // Mensagem pública no chat geral
    socket.on('publicMessage', (messageData) => {
      storeAPI.dispatch({ 
        type: RECEIVE_MESSAGE, 
        payload: {
          id: messageData.id || Date.now(),
          senderId: messageData.senderId,
          senderName: messageData.senderName,
          content: messageData.content,
          timestamp: messageData.timestamp,
          type: 'public'
        }
      });
    });

    // Mensagem privada
    socket.on('privateMessage', (messageData) => {
      storeAPI.dispatch({ 
        type: RECEIVE_PRIVATE_MESSAGE, 
        payload: {
          id: messageData.id || Date.now(),
          senderId: messageData.senderId,
          senderName: messageData.senderName,
          recipientId: messageData.recipientId,
          content: messageData.content,
          timestamp: messageData.timestamp,
          type: 'private'
        }
      });
    });

    // Status de digitação
    socket.on('userTyping', ({ userId, userName, isTyping }) => {
      storeAPI.dispatch({ 
        type: RECEIVE_TYPING_STATUS, 
        payload: {
          userId,
          userName,
          isTyping,
          timestamp: Date.now()
        }
      });
    });

    // === EVENTOS DE DESCONEXÃO ===
    socket.on('userDisconnect', (socketId) => {
      storeAPI.dispatch({ type: USER_DISCONNECT, payload: socketId });
      storeAPI.dispatch({ type: REMOVE_ONLINE_USER, payload: socketId });
      
      if (peers[socketId]) {
        peers[socketId].destroy();
        delete peers[socketId];
      }
    });

    // === EVENTOS EXISTENTES ===
    socket.on('movementMessage', (arg) => {
      try {
        const action = JSON.parse(arg);
        storeAPI.dispatch(action);
      } catch (err) {
        console.error('Erro movementMessage:', err);
      }
    });

    socket.on('receivedAnnouncement', (arg) => {
      try {
        const action = JSON.parse(arg);
        storeAPI.dispatch(action);
      } catch (err) {
        console.error('Erro announcement:', err);
      }
    });

    socket.on('receiveDirect', (arg) => {
      if (arg?.type && arg?.payload) {
        storeAPI.dispatch(arg);
      }
    });

    // === EVENTOS DE ERRO ===
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('disconnect', () => {
      console.log('Desconectado do servidor');
    });

    // === MIDDLEWARE REDUX ===
    return (next) => (action) => {
      const result = next(action);
      const state = storeAPI.getState();

      switch (action.type) {
        case 'JOIN_VIDEO':
          // Criar peers iniciadores para cada participante
          const { video } = state;
          video.socketArr.forEach((userId) => {
            if (userId !== socket.id && !peers[userId]) {
              const peer = createPeer(userId, socket.id, video.localStream, socket);
              peers[userId] = peer;
            }
          });
          break;

        case 'WALK':
          socket.volatile.emit('movementMessage', JSON.stringify({
            type: 'UPDATE_OTHERS',
            payload: state.players[action.payload.id],
          }));
          break;

        case 'ANNOUNCEMENT':
          socket.emit('announcement', JSON.stringify({
            type: 'RECEIVED_ANNOUNCEMENT',
            payload: state.outgoingGif,
          }));
          break;

        case 'SEND_DIRECT':
          socket.emit('sendDirect', {
            type: 'RECEIVE_DIRECT',
            payload: state.outgoingGif,
          });
          break;

        // === NOVAS AÇÕES DE COMUNICAÇÃO ===
        case 'SEND_PUBLIC_MESSAGE':
          socket.emit('publicMessage', {
            content: action.payload.content,
            senderId: socket.id,
            senderName: action.payload.senderName || 'Anônimo',
            timestamp: Date.now()
          });
          break;

        case 'SEND_PRIVATE_MESSAGE':
          socket.emit('privateMessage', {
            content: action.payload.content,
            recipientId: action.payload.recipientId,
            senderId: socket.id,
            senderName: action.payload.senderName || 'Anônimo',
            timestamp: Date.now()
          });
          break;

        case 'SET_TYPING_STATUS':
          socket.emit('typing', {
            isTyping: action.payload.isTyping,
            userId: socket.id,
            userName: action.payload.userName || 'Anônimo'
          });
          break;

        case 'UPDATE_USER_PROFILE':
          socket.emit('updateProfile', {
            userId: socket.id,
            profile: action.payload
          });
          break;

        case 'REQUEST_USER_INFO':
          socket.emit('requestUserInfo', {
            userId: action.payload.userId
          });
          break;

        case 'BLOCK_USER':
          socket.emit('blockUser', {
            userId: socket.id,
            blockedUserId: action.payload.userId
          });
          break;

        case 'UNBLOCK_USER':
          socket.emit('unblockUser', {
            userId: socket.id,
            unblockedUserId: action.payload.userId
          });
          break;

        case 'REPORT_USER':
          socket.emit('reportUser', {
            reporterId: socket.id,
            reportedUserId: action.payload.userId,
            reason: action.payload.reason
          });
          break;

        case 'JOIN_ROOM':
          socket.emit('joinRoom', {
            roomId: action.payload.roomId,
            userId: socket.id
          });
          break;

        case 'LEAVE_ROOM':
          socket.emit('leaveRoom', {
            roomId: action.payload.roomId,
            userId: socket.id
          });
          break;

        case 'SEND_ROOM_MESSAGE':
          socket.emit('roomMessage', {
            roomId: action.payload.roomId,
            content: action.payload.content,
            senderId: socket.id,
            senderName: action.payload.senderName || 'Anônimo',
            timestamp: Date.now()
          });
          break;

        default:
          break;
      }

      return result;
    };
  };
};

// === FUNÇÕES AUXILIARES ===
export const createCommunicationActions = () => ({
  // Mensagens públicas
  sendPublicMessage: (content, senderName) => ({
    type: 'SEND_PUBLIC_MESSAGE',
    payload: { content, senderName }
  }),

  // Mensagens privadas
  sendPrivateMessage: (content, recipientId, senderName) => ({
    type: 'SEND_PRIVATE_MESSAGE',
    payload: { content, recipientId, senderName }
  }),

  // Status de digitação
  setTypingStatus: (isTyping, userName) => ({
    type: 'SET_TYPING_STATUS',
    payload: { isTyping, userName }
  }),

  // Atualizar perfil
  updateUserProfile: (profile) => ({
    type: 'UPDATE_USER_PROFILE',
    payload: profile
  }),

  // Solicitar informações do usuário
  requestUserInfo: (userId) => ({
    type: 'REQUEST_USER_INFO',
    payload: { userId }
  }),

  // Bloquear usuário
  blockUser: (userId) => ({
    type: 'BLOCK_USER',
    payload: { userId }
  }),

  // Desbloquear usuário
  unblockUser: (userId) => ({
    type: 'UNBLOCK_USER',
    payload: { userId }
  }),

  // Reportar usuário
  reportUser: (userId, reason) => ({
    type: 'REPORT_USER',
    payload: { userId, reason }
  }),

  // Gerenciar salas
  joinRoom: (roomId) => ({
    type: 'JOIN_ROOM',
    payload: { roomId }
  }),

  leaveRoom: (roomId) => ({
    type: 'LEAVE_ROOM',
    payload: { roomId }
  }),

  sendRoomMessage: (roomId, content, senderName) => ({
    type: 'SEND_ROOM_MESSAGE',
    payload: { roomId, content, senderName }
  })
});

// === HOOKS PARA USAR NOS COMPONENTES ===
export const useCommunication = () => {
  const actions = createCommunicationActions();
  
  return {
    ...actions,
    // Função para enviar mensagem com validação
    sendMessage: (content, type = 'public', options = {}) => {
      if (!content || content.trim() === '') {
        throw new Error('Conteúdo da mensagem não pode estar vazio');
      }

      if (content.length > 1000) {
        throw new Error('Mensagem muito longa (máximo 1000 caracteres)');
      }

      const trimmedContent = content.trim();

      if (type === 'private') {
        if (!options.recipientId) {
          throw new Error('ID do destinatário é obrigatório para mensagens privadas');
        }
        return actions.sendPrivateMessage(trimmedContent, options.recipientId, options.senderName);
      } else if (type === 'room') {
        if (!options.roomId) {
          throw new Error('ID da sala é obrigatório para mensagens de sala');
        }
        return actions.sendRoomMessage(options.roomId, trimmedContent, options.senderName);
      } else {
        return actions.sendPublicMessage(trimmedContent, options.senderName);
      }
    }
  };
};