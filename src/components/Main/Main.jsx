import React, { useState, useEffect, useRef } from "react";
import { useContext } from "react";
import { Context } from "../../context/Context";
import { getAuth } from "firebase/auth";
import Vapi from "@vapi-ai/web";
import "./Main.css";
import { assets } from "../../assets/assets";

const vapi = new Vapi(import.meta.env.VITE_VAPI_API_KEY);
const assistant_id = import.meta.env.VITE_VAPI_ASSISTANT_ID;

const Main = () => {
  const {
    input,
    setInput,
    onSent,
    recentPrompt,
    showResult,
    messages,
    loading,
    sendImage, 
  } = useContext(Context);

  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startCall = () => {
    setIsCalling(true);
    const userId = getAuth().currentUser.uid;
    vapi.start(assistant_id, {
      metadata: { userId: userId }
    }).then((callId) => {
      console.log('Started call with ID:', callId);
    }).catch((error) => {
      console.error('Failed to start call:', error);
    });
  };

  const endCall = () => {
    setIsCalling(false);
    vapi.stop()
  };

  const toggleMute = () => {
    const newMuteState = !vapi.isMuted();
    vapi.setMuted(newMuteState);
    setIsMuted(newMuteState);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      sendImage(file);
    }
  };

  return (
    <>
      <div className="main">
        <div className="nav">
          <p>Cheers AI</p>
          <img src={assets.user_icon} alt="UserIcon" />
        </div>
        <div className="main-container">
          {!showResult ? (
            <>
              <div className="greet">
                <p>
                  <span>Hello, How are you feeling today</span>
                </p>
                <p>How can I help you today?</p>
              </div>
              <div className="cards">
                <div className="card">
                  <p>I am having Sleep Problem</p>
                  <img src={assets.compass_icon} alt="CompassIcon" />
                </div>
                <div className="card">
                  <p>Plan a low-carb meal with what's available in my fridge</p>
                  <img src={assets.bulb_icon} alt="CompassIcon" />
                </div>
                <div className="card">
                  <p>List some uplifting thing I can do to lift up my mood</p>
                  <img src={assets.message_icon} alt="CompassIcon" />
                </div>
                <div className="card">
                  <p>What are some things I can do to improve my mental health</p>
                  <img src={assets.code_icon} alt="CompassIcon" />
                </div>
              </div>
            </>
          ) : (
            <div className="result">
              <div className="result-title">
                <img src={assets.user_icon} alt="UserIcon" />
                <p>{recentPrompt}</p>
              </div>
              <div className="result-data">
                <img src={assets.gemini_icon} alt="GeminiIcon" />
                {loading ? (
                  <div className="loader">
                    <hr />
                    <hr />
                    <hr />
                  </div>
                ) : (
                  <>
                    <div className="messages__container">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                        >
                          {message.text}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {isCalling && (
            <div className="call-overlay">
              <div className="call-ui">
                <img src={assets.mic_icon} alt="MicIcon" className="center-icon" />
                <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
                <button onClick={endCall}>End Call</button>
              </div>
            </div>
          )}
          <div className="main-bottom">
            <div className="search-box">
              <input
                onChange={(event) => setInput(event.target.value)}
                value={input}
                type="text"
                placeholder="Enter a prompt here"
              />
              <div className="search-box-icon">
                <img src={assets.gallery_icon} alt="GalleryIcon" onClick={() => fileInputRef.current.click()} />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <img src={assets.mic_icon} alt="MicIcon" onClick={startCall} />
                {input ? (
                  <img
                    onClick={() => onSent()}
                    src={assets.send_icon}
                    alt="SendIcon"
                  />
                ) : null}
              </div>
            </div>
            <p className="bottom-info">
              Your mental health is important to us. Please do not hesitate to ask us any questions.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Main;