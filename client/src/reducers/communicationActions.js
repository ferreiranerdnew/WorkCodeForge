// src/reducers/communicationActions.js

// === AÇÕES PARA USUÁRIOS ONLINE ===
export const SET_ONLINE_USERS = 'SET_ONLINE_USERS';
export const ADD_ONLINE_USER = 'ADD_ONLINE_USER';
export const REMOVE_ONLINE_USER = 'REMOVE_ONLINE_USER';
export const UPDATE_USER_STATUS = 'UPDATE_USER_STATUS';

// === AÇÕES PARA MENSAGENS ===
export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE';
export const RECEIVE_PRIVATE_MESSAGE = 'RECEIVE_PRIVATE_MESSAGE';
export const SEND_PUBLIC_MESSAGE = 'SEND_PUBLIC_MESSAGE';
export const SEND_PRIVATE_MESSAGE = 'SEND_PRIVATE_MESSAGE';
export const CLEAR_MESSAGES = 'CLEAR_MESSAGES';
export const DELETE_MESSAGE = 'DELETE_MESSAGE';

// === AÇÕES PARA TYPING STATUS ===
export const RECEIVE_TYPING_STATUS = 'RECEIVE_TYPING_STATUS';
export const SET_TYPING_STATUS = 'SET_TYPING_STATUS';
export const CLEAR_TYPING_STATUS = 'CLEAR_TYPING_STATUS';

// === AÇÕES PARA NOTIFICAÇÕES ===
export const RECEIVE_USER_JOINED = 'RECEIVE_USER_JOINED';
export const RECEIVE_USER_LEFT = 'RECEIVE_USER_LEFT';
export const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
export const CLEAR_NOTIFICATIONS = 'CLEAR_NOTIFICATIONS';

// === AÇÕES PARA SALAS ===
export const JOIN_ROOM = 'JOIN_ROOM';
export const LEAVE_ROOM = 'LEAVE_ROOM';
export const SEND_ROOM_MESSAGE = 'SEND_ROOM_MESSAGE';
export const RECEIVE_ROOM_MESSAGE = 'RECEIVE_ROOM_MESSAGE';
export const SET_ACTIVE_ROOM = 'SET_ACTIVE_ROOM';

// === AÇÕES PARA PERFIL ===
export const UPDATE_USER_PROFILE = 'UPDATE_USER_PROFILE';
export const REQUEST_USER_INFO = 'REQUEST_USER_INFO';
export const RECEIVE_USER_INFO = 'RECEIVE_USER_INFO';

// === AÇÕES PARA MODERAÇÃO ===
export const BLOCK_USER = 'BLOCK_USER';
export const UNBLOCK_USER = 'UNBLOCK_USER';
export const REPORT_USER = 'REPORT_USER';
export const MUTE_USER = 'MUTE_USER';
export const UNMUTE_USER = 'UNMUTE_USER';

// === ACTION CREATORS ===

// Usuários online
export const setOnlineUsers = (users) => ({
  type: SET_ONLINE_USERS,
  payload: users
});

export const addOnlineUser = (user) => ({
  type: ADD_ONLINE_USER,
  payload: user
});

export const removeOnlineUser = (userId) => ({
  type: REMOVE_ONLINE_USER,
  payload: userId
});

export const updateUserStatus = (userId, status, lastSeen) => ({
  type: UPDATE_USER_STATUS,
  payload: { userId, status, lastSeen }
});

// Mensagens
export const receiveMessage = (message) => ({
  type: RECEIVE_MESSAGE,
  payload: message
});

export const receivePrivateMessage = (message) => ({
  type: RECEIVE_PRIVATE_MESSAGE,
  payload: message
});

export const sendPublicMessage = (content, senderName) => ({
  type: SEND_PUBLIC_MESSAGE,
  payload: { content, senderName }
});

export const sendPrivateMessage = (content, recipientId, senderName) => ({
  type: SEND_PRIVATE_MESSAGE,
  payload: { content, recipientId, senderName }
});

export const clearMessages = () => ({
  type: CLEAR_MESSAGES
});

export const deleteMessage = (messageId) => ({
  type: DELETE_MESSAGE,
  payload: messageId
});

// Typing status
export const receiveTypingStatus = (userId, userName, isTyping) => ({
  type: RECEIVE_TYPING_STATUS,
  payload: { userId, userName, isTyping }
});

export const setTypingStatus = (isTyping, userName) => ({
  type: SET_TYPING_STATUS,
  payload: { isTyping, userName }
});

export const clearTypingStatus = () => ({
  type: CLEAR_TYPING_STATUS
});

// Notificações
export const receiveUserJoined = (message, userId) => ({
  type: RECEIVE_USER_JOINED,
  payload: { message, userId, timestamp: Date.now() }
});

export const receiveUserLeft = (message, userId) => ({
  type: RECEIVE_USER_LEFT,
  payload: { message, userId, timestamp: Date.now() }
});

export const addNotification = (notification) => ({
  type: ADD_NOTIFICATION,
  payload: {
    id: Date.now(),
    ...notification,
    timestamp: Date.now()
  }
});

export const removeNotification = (notificationId) => ({
  type: REMOVE_NOTIFICATION,
  payload: notificationId
});

export const clearNotifications = () => ({
  type: CLEAR_NOTIFICATIONS
});

// Salas
export const joinRoom = (roomId) => ({
  type: JOIN_ROOM,
  payload: { roomId }
});

export const leaveRoom = (roomId) => ({
  type: LEAVE_ROOM,
  payload: { roomId }
});

export const sendRoomMessage = (roomId, content, senderName) => ({
  type: SEND_ROOM_MESSAGE,
  payload: { roomId, content, senderName }
});

export const receiveRoomMessage = (message) => ({
  type: RECEIVE_ROOM_MESSAGE,
  payload: message
});

export const setActiveRoom = (roomId) => ({
  type: SET_ACTIVE_ROOM,
  payload: roomId
});

// Perfil
export const updateUserProfile = (profile) => ({
  type: UPDATE_USER_PROFILE,
  payload: profile
});

export const requestUserInfo = (userId) => ({
  type: REQUEST_USER_INFO,
  payload: { userId }
});

export const receiveUserInfo = (userInfo) => ({
  type: RECEIVE_USER_INFO,
  payload: userInfo
});

// Moderação
export const blockUser = (userId) => ({
  type: BLOCK_USER,
  payload: { userId }
});

export const unblockUser = (userId) => ({
  type: UNBLOCK_USER,
  payload: { userId }
});

export const reportUser = (userId, reason) => ({
  type: REPORT_USER,
  payload: { userId, reason }
});

export const muteUser = (userId, duration) => ({
  type: MUTE_USER,
  payload: { userId, duration }
});

export const unmuteUser = (userId) => ({
  type: UNMUTE_USER,
  payload: { userId }
});