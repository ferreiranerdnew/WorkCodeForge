// src/components/Chat.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import {
  ANNOUNCEMENT,
  SEND_DIRECT,
  CLEAR_INCOMING,
  TOGGLE_GIF_SEARCH_OPEN,
  JOIN_VIDEO,
} from '../../reducers/mapReducer_old';
import './chat.css';
import { FaClipboardList } from 'react-icons/fa';
import VideoContainer from '../video/video';

export default function Chat({ canOpen }) {
  const [showGif, setShowGif] = useState(false);
  const [receiver, setReceiver] = useState('Everyone');
  const [showInstruction, setShowInstruction] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const dispatch = useDispatch();
  const { width, height, topMargin, leftMargin } = useWindowDimensions();

  const userId = useSelector((state) => state.user.id);
  const playersArr = useSelector((state) => state.players);
  const incomingGifState = useSelector((state) => state.incomingGif);
  const onlineUsers = useSelector((state) => state.players);
  const gifSearchOpen = useSelector((state) => state.gifSearchOpen);

  useEffect(() => {
    if (!incomingGifState.gifObj || !canOpen) return;
    setShowGif(true);
    const timer = setTimeout(() => {
      setShowGif(false);
      dispatch(CLEAR_INCOMING());
    }, 5200);
    return () => clearTimeout(timer);
  }, [incomingGifState, canOpen, dispatch]);

  const toggleGifSearch = () => {
    dispatch(TOGGLE_GIF_SEARCH_OPEN());
  };

  const toggleInstruction = () => {
    setShowInstruction(!showInstruction);
  };

  const toggleVideoCall = () => {
    if (videoOn) {
      // Parar chamada de vídeo
      setVideoOn(false);
      console.log('Chamada de vídeo encerrada');
    } else {
      // Iniciar chamada de vídeo
      dispatch(JOIN_VIDEO());
      setVideoOn(true);
      console.log('Chamada de vídeo iniciada');
    }
  };

  const userArr = Object.values(onlineUsers).map((user) => user.name);
  const userSelectList = userArr.map((name, index) => (
    <option key={index} value={name}>
      {name}
    </option>
  ));

  return (
    <>
      {canOpen && (
        <button
          className="nes-btn is-primary"
          onClick={toggleInstruction}
          style={{
            zIndex: 21,
            position: 'absolute',
            left: width - leftMargin - 255,
            top: topMargin + 38,
            width: 186,
            height: 39,
            paddingLeft: 3,
          }}
        >
          Instruction
        </button>
      )}

      {canOpen && showInstruction && (
        <div
          className="nes-container is-rounded is-dark"
          style={{
            position: 'absolute',
            left: (width - 375) / 2,
            top: (height - 200) / 2,
            width: 375,
            height: 200,
            margin: '0 15px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ color: 'white', margin: 0 }}>Instruction</h2>
            <section className="icon-list">
              <i
                className="nes-icon close is-small nes-pointer"
                onClick={toggleInstruction}
                style={{ backgroundColor: 'white' }}
              />
            </section>
          </div>
          <p>Move: ⬆ ➡ ⬇ ⬅</p>
          <p>Action: Space</p>
          <p>Close window: Space</p>
        </div>
      )}

      {canOpen &&
        playersArr[userId] &&
        playersArr[userId].socketId &&
        playersArr[userId].skin && (
          <button
            className="nes-btn is-primary"
            onClick={toggleGifSearch}
            style={{
              zIndex: 20,
              position: 'absolute',
              left: width - leftMargin - 255,
              top: topMargin + 134,
              width: 186,
              height: 39,
              paddingLeft: 3,
            }}
          >
            Send a GIF
          </button>
        )}

      {canOpen && (
        <button
          className={`nes-btn ${videoOn ? 'is-error' : 'is-success'}`}
          onClick={toggleVideoCall}
          style={{
            zIndex: 20,
            position: 'absolute',
            left: width - leftMargin - 255,
            top: topMargin + 190,
            width: 186,
            height: 39,
            paddingLeft: 3,
          }}
        >
          {videoOn ? 'End Video Call' : 'Start Video Call'}
        </button>
      )}

      {canOpen && (
        <h1
          style={{
            position: 'absolute',
            left: leftMargin,
            top: topMargin - 10,
            margin: 0,
            color: 'white',
            zIndex: -200,
          }}
        >
          Beauty Services{/* RFERREIRA MUDAR PARTE SUPERIOR DO */}
        </h1>
      )}

      {gifSearchOpen && canOpen && (
        <div
          className="nes-container is-rounded is-dark"
          style={{
            zIndex: 20,
            position: 'absolute',
            left: width / 2 + 200,
            top: height / 2 - 150,
            width: 335,
            margin: '0 15px',
          }}
          onKeyPressCapture={(e) => {
            if (e.code === 'Space') e.stopPropagation();
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ color: 'white', margin: 0 }}>Send a GIF!</h3>
            <section className="icon-list">
              <i
                className="nes-icon close is-small nes-pointer"
                onClick={toggleGifSearch}
                style={{ backgroundColor: 'white' }}
              />
            </section>
          </div>

          <label htmlFor="user-select" style={{ color: 'white', marginTop: 8 }}>
            To:
          </label>
          <select
            id="user-select"
            style={{ width: '100%' }}
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
          >
            <option value="Everyone">Everyone</option>
            {userSelectList}
          </select>

          {/* GIF search box implementation can be added here */}
        </div>
      )}

      {showGif && canOpen && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            left: width / 2 + 260,
            top: height / 2 - 70,
          }}
        >
          <p
            className="nes-balloon from-right"
            style={{
              width: 235,
              marginBottom: 0,
              padding: 10,
              justifyContent: 'center',
            }}
          >
            A GIF from: {incomingGifState.senderName} to{' '}
            {incomingGifState.receiverName || 'everyone'}
          </p>

          <iframe
            title="GIF"
            src={incomingGifState.gifObj.embed_url}
            width={235}
            height={235}
            frameBorder="0"
            className="giphy-embed"
            style={{ justifyContent: 'center' }}
          />
        </div>
      )}

      {videoOn && canOpen && (
        <div
          className="video-wrapper"
          style={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            width: 'auto', 
            zIndex: 1000,
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          <VideoContainer />
        </div>
      )}
    </>
  );
}