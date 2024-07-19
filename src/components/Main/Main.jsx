import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faBars } from '@fortawesome/free-solid-svg-icons';
import { useContext } from "react";
import { Context } from "../../context/Context";
import { getAuth } from "firebase/auth";
import Vapi from "@vapi-ai/web";
import "./Main.css";
import { assets } from "../../assets/assets";

const vapi = new Vapi(import.meta.env.VITE_VAPI_API_KEY);
const assistant_id = import.meta.env.VITE_VAPI_ASSISTANT_ID;

const FileUploadIndicator = ({ file, onRemove }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [file]);

  return (
    <div className="file-upload-indicator">
      {preview ? (
        <img src={preview} alt="Preview" className="file-preview" />
      ) : (
        <div className="file-icon">{file.name.slice(-3)}</div>
      )}
      <span className="file-name">{file.name}</span>
      <button onClick={() => onRemove(file)}>×</button>
    </div>
  );
};

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
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // State for showing popup
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);
  const inputRef = useRef(null); // Ref for the textarea element

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles(prevFiles => [...prevFiles, ...files]);
    files.forEach(file => sendImage(file));
  };

  const removeUploadedFile = (fileToRemove) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let timer;
    if (isCalling) {
      timer = setInterval(() => {
        setCallDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCalling]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    setIsCalling(true);
    setCallDuration(0);

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

  const handleBurgerClick = () => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000); // Hide popup after 2 seconds
  };

  const handleCardClick = (text) => {
    setInput(text);
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
    adjustInputHeight();
  };

  const adjustInputHeight = () => {
    const inputElement = inputRef.current;
    inputElement.style.height = "auto";
    inputElement.style.height = `${inputElement.scrollHeight}px`;
  };

  useEffect(() => {
    adjustInputHeight();
  }, [input]);

  return (
    <>
      <div className="main">
        <div className="nav">
          <FontAwesomeIcon icon={faBars} className="burger-menu" onClick={handleBurgerClick} /> {/* Replace logo with burger menu icon */}
          <p className="logo">CheersAI</p>
          <img src={assets.user_icon} alt="UserIcon" />
        </div>

        {showPopup && (
          <div className="popup">
            Access Denied
          </div>
        )}

        <div className="main-container">
          {!showResult ? (
            <>
              <div className="greet">
                <p>
                  <span>Hey there!</span>
                </p>
                <p>How are you feeling today?</p>
              </div>
              <div className="cards">
                <div className="card" onClick={() => handleCardClick("I am having a sleeping problem. What can I do?")}>
                  <p>I am having a sleeping problem. What can I do?</p>
                  <img src={assets.compass_icon} alt="CompassIcon" />
                </div>
                <div className="card" onClick={() => handleCardClick("How do I deal with anxiety?")}>
                  <p>How do I deal with anxiety?</p>
                  <img src={assets.bulb_icon} alt="CompassIcon" />
                </div>
                <div className="card" onClick={() => handleCardClick("List some uplifting things I can do to better my mood.")}>
                  <p>List some uplifting things I can do to better my mood.</p>
                  <img src={assets.message_icon} alt="CompassIcon" />
                </div>
                <div className="card" onClick={() => handleCardClick("What are some things I can do to improve my mental health?")}>
                  <p>What are some things I can do to improve my mental health?</p>
                  <img src={assets.code_icon} alt="CompassIcon" />
                </div>
              </div>
            </>
          ) : (
            <div className="result">
              <div className="result-title">
                <p>{recentPrompt}</p>
              </div>
              <div className="result-data">
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
                          {message.sender === 'bot' && (
                            <img src={assets.logo_icon} alt="logoIcon" className="logo-icon" />
                          )}
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
              <div className="call-modal">
                <div className="call-timer">{formatTime(callDuration)}</div>
                <div className="call-status">
                  Ava speaking<span className="blinking-dots">...</span>
                </div>
                <div className="call-buttons">
                  <button onClick={endCall} className="call-button">
                    <img src={assets.end_call_icon} alt="End Call" />
                  </button>
                  <button onClick={toggleMute} className={`call-button ${isMuted ? 'muted' : ''}`}>
                    <img src={assets.mute_icon} alt="Mute" />
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="main-bottom">
            <div className="file-upload-container">
              {uploadedFiles.map((file, index) => (
                <FileUploadIndicator
                  key={index}
                  file={file}
                  onRemove={removeUploadedFile}
                />
              ))}
            </div>
            <div className="search-box">
              <textarea
                ref={inputRef}
                onChange={handleInputChange}
                value={input}
                placeholder="Message"
                rows="1"
                style={{
                  overflow: 'hidden',
                  resize: 'none',
                  minHeight: '40px',
                  maxHeight: '150px',
                }}
              />
              <div className="search-box-icon">
                <img
                  src={assets.gallery_icon}
                  alt="GalleryIcon"
                  onClick={() => fileInputRef.current.click()}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <FontAwesomeIcon icon={faPhone} onClick={startCall} style={{ height: '25px' }} />
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
