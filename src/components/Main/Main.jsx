import React, { useContext, useState, useEffect, useRef } from "react";
import { RiUser3Line } from "react-icons/ri";
import { Context } from "../../context/Context";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Vapi from "@vapi-ai/web";
import "./Main.css";
import { assets } from "../../assets/assets";
import { FaPhoneAlt } from "react-icons/fa";

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
  const [showPopup, setShowPopup] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsScrolled, setTermsScrolled] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has accepted the terms
    const acceptedTerms = localStorage.getItem("acceptedTerms");
    if (!acceptedTerms) {
      setShowTermsModal(true);
    }
  }, []);

  const handleTermsAccept = () => {
    localStorage.setItem("acceptedTerms", "true");
    setShowTermsModal(false);
  };

  const handleTermsScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setTermsScrolled(true);
    }
  };

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
    vapi.stop();
  };

  const toggleMute = () => {
    const newMuteState = !vapi.isMuted();
    vapi.setMuted(newMuteState);
    setIsMuted(newMuteState);
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      console.log('User logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleBurgerClick = () => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
  };

  const handleCardClick = (text) => {
    setInput(text);
  };

  const handleSend = () => {
    onSent();
    setUploadedFiles([]);
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
          <div className="mobile-logout">
            <img src={assets.logout1_icon} alt="Logout" className="logout-icon" onClick={() => setShowLogoutModal(true)} />
          </div>
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
                <div className="card wider-card" onClick={startCall}>
                  <p>Looking out for support to overcome your mental trauma at the moment? Call us now!</p>
                  <img src={assets.call_icon} alt="CallIcon" />
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
                  <div className="messages__container">
                    {messages.map((message, index) => (
                      <div key={index} className={`message-wrapper ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                        <div className="message">
                          {message.sender === 'user' && (
                            <RiUser3Line className="profile-icon" />
                          )}
                          {message.sender === 'bot' && (
                            <img src={assets.logo_icon} alt="logoIcon" className="logo-icon" />
                          )}
                          {message.sender === 'bot' ? (
                            <div dangerouslySetInnerHTML={{ __html: message.text }} />
                          ) : (
                            message.text
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>
          )}
          {isCalling && (
            <div className="call-overlay">
              <div className="call-modal">
                <div className="call-timer">{formatTime(callDuration)}</div>
                <div className="call-status">
                  Ivy speaking<span className="blinking-dots">...</span>
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
                <FaPhoneAlt onClick={startCall} style={{ color: '#8A2BE2', fontSize: '20px' }} />
                {input ? (
                  <img
                    onClick={handleSend}
                    src={assets.send_icon}
                    alt="SendIcon"
                  />
                ) : null}
              </div>
            </div>
            <p className="bottom-info">
              CheersAI may not be accurate at all times.
            </p>
          </div>
        </div>
      </div>
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <p>Are you sure you want to log out?</p>
            <div className="logout-buttons">
              <button onClick={handleLogout}>Log Out</button>
              <button onClick={() => setShowLogoutModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showTermsModal && (
        <div className="terms-modal">
          <div className="terms-content">
            <h2>Terms of Service</h2>
            <div className="terms-text" onScroll={handleTermsScroll}>
              <p>Effective Date: [July 2nd, 2024]</p>
              <p>Welcome to CheersAI! These Terms of Service ("Terms") govern your access and use of the CheersAI platform, including our website at CheersAI.co and our AI therapist services. By using our platform, you agree to comply with and be bound by these Terms. If you do not agree with these Terms, please do not use our services.</p>
              <p>1. Acceptance of Terms</p>
              <p>By accessing or using CheersAI, you agree to these Terms, including any updates or modifications. We may update these Terms from time to time, and your continued use of the platform indicates your acceptance of the updated Terms. If you do not agree with the changes, you should stop using our services.</p>
              <p>2. Services Provided</p>
              <p>CheersAI offers a platform where users can interact with an AI therapist through chat and call features. The AI therapist provides support and guidance but is not a substitute for professional mental health services.</p>
              <p>3. User Data and Privacy</p>
              <p>3.1 Data Collection: We collect and store conversations and interactions between users and the AI therapist to improve and update the AI's contextual understanding.</p>
              <p>3.2 Data Privacy: We are committed to protecting your privacy. We do not sell your data to third parties. For more information, please review our Privacy Policy.</p>
              <p>3.3 Data Deletion: Users can request data deletion at any time by contacting us at support.cheersai@gmail.com or using the delete data button available on the platform. Once requested, data will be permanently deleted from our databases.</p>
              <p>4. User Responsibilities</p>
              <p>4.1 Age Requirement: You must be at least 13 years old to use our services. If you are under 13, you must have the consent of a parent or guardian.</p>
              <p>4.2 Account Security: You are responsible for maintaining the confidentiality of your account and password. Please notify us immediately of any unauthorized use of your account.</p>
              <p>4.3 Prohibited Conduct: You agree not to use the platform for any unlawful or harmful purposes, including but not limited to harassment, abuse, or dissemination of inappropriate content.</p>
              <p>5. Intellectual Property</p>
              <p>All content, trademarks, and intellectual property on the CheersAI platform are owned by CheersAI or its licensors. You may not use, reproduce, or distribute any content from our platform without prior written consent.</p>
              <p>6. Limitation of Liability</p>
              <p>CheersAI is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our services are provided "as is," and we do not guarantee the accuracy, reliability, or suitability of the information provided.</p>
              <p>7. Updates to Terms</p>
              <p>We may update these Terms periodically to reflect changes in our services or legal requirements. Users will be notified of significant changes, and continued use of the platform after such updates constitutes acceptance of the revised Terms. If you do not agree with the updated Terms, you must discontinue using our services.</p>
              <p>8. Termination of Services</p>
              <p>We reserve the right to suspend or terminate your access to the platform at our discretion, without notice, for any violation of these Terms or other reasons deemed appropriate by CheersAI.</p>
              <p>9. Contact Information</p>
              <p>If you have any questions or concerns about these Terms, please contact us at support.cheersai@gmail.com.</p>
              <p>10. Governing Law</p>
              <p>These Terms are governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law principles.</p>
              <p>11. Entire Agreement</p>
              <p>These Terms constitute the entire agreement between you and CheersAI regarding your use of our platform and services and supersede any prior agreements or understandings.</p>
              <p>By using CheersAI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. Thank you for choosing CheersAI for your mental wellness journey.</p>
              <p>Please note that this Terms of Service document is a general guideline. It is recommended to have a legal professional review and customize the document to fit the specific legal requirements and business practices of CheersAI.</p>
            </div>
            <div className="terms-acceptance">
              <button
                type="button"
                className="new"
                onClick={handleTermsAccept}
                disabled={!termsScrolled}
              >
                Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Main;
